import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const BUFFER_MINS = 15;
const SLOT_STEP_MINS = 15;

interface GetAvailableSlotsParams {
  serviceId: number;
  /** Date in "YYYY-MM-DD" form, interpreted in the shop's local time */
  date: string;
}

/**
 * Returns a list of bookable start times (ISO strings) for the given
 * service on the given date, accounting for:
 * - the day's operating hours (or a barber_schedules override/off-day)
 * - the service duration + mandatory 15-minute buffer
 * - existing confirmed bookings and unexpired 10-minute holds
 */
export async function getAvailableSlots({
  serviceId,
  date,
}: GetAvailableSlotsParams): Promise<string[]> {
  const supabase = createAdminClient();

  const { data: service } = await supabase
    .from("services")
    .select("duration_mins")
    .eq("id", serviceId)
    .single();

  if (!service) return [];

  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

  const [{ data: hours }, { data: overrides }] = await Promise.all([
    supabase
      .from("operating_hours")
      .select("*")
      .eq("day_of_week", dayOfWeek)
      .maybeSingle(),
    supabase
      .from("barber_schedules")
      .select("*")
      .eq("override_date", date),
  ]);

  const dayOff = overrides?.some((o) => o.is_off) ?? false;
  if (!hours || hours.is_closed || dayOff) return [];

  const override = overrides?.find((o) => !o.is_off && o.start_time && o.end_time);
  const openTime = override?.start_time ?? hours.open_time;
  const closeTime = override?.end_time ?? hours.close_time;

  const totalBlock = service.duration_mins + BUFFER_MINS;

  const dayStart = new Date(`${date}T${openTime}`);
  const dayEnd = new Date(`${date}T${closeTime}`);

  // Existing active bookings (confirmed) and unexpired holds for that day
  const nowIso = new Date().toISOString();
  const { data: existing } = await supabase
    .from("bookings")
    .select("appointment_timestamp, buffer_end_timestamp, status, held_until")
    .gte("appointment_timestamp", dayStart.toISOString())
    .lt("appointment_timestamp", dayEnd.toISOString())
    .in("status", ["confirmed", "held"]);

  const blockingRanges = (existing ?? [])
    .filter((b) => b.status === "confirmed" || !b.held_until || b.held_until > nowIso)
    .map((b) => ({
      start: new Date(b.appointment_timestamp).getTime(),
      end: new Date(b.buffer_end_timestamp).getTime(),
    }));

  const slots: string[] = [];
  const stepMs = SLOT_STEP_MINS * 60 * 1000;
  const now = Date.now();

  for (
    let cursor = dayStart.getTime();
    cursor + totalBlock * 60 * 1000 <= dayEnd.getTime();
    cursor += stepMs
  ) {
    if (cursor <= now) continue; // no past slots

    const slotEnd = cursor + totalBlock * 60 * 1000;
    const overlaps = blockingRanges.some(
      (range) => cursor < range.end && slotEnd > range.start
    );
    if (!overlaps) {
      slots.push(new Date(cursor).toISOString());
    }
  }

  return slots;
}
