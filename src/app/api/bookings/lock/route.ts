import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

interface LockRequestBody {
  serviceId: number;
  appointmentTimestamp: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as LockRequestBody;
  const { serviceId, appointmentTimestamp } = body;

  if (!serviceId || !appointmentTimestamp) {
    return NextResponse.json(
      { error: "serviceId and appointmentTimestamp are required" },
      { status: 400 }
    );
  }

  // Attach the signed-in customer if there's already an active session.
  // Guest name/phone and the payment method are collected next, on the
  // checkout screen, and patched onto the booking before it's confirmed.
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("hold_booking_slot", {
    p_customer_id: user?.id ?? null,
    p_service_id: serviceId,
    p_appointment_time: appointmentTimestamp,
    p_payment_method: "pay_in_person",
    p_guest_name: null,
    p_guest_phone: null,
  });

  if (error) {
    const message = error.message.includes("locked or booked")
      ? "This slot is temporarily held. Please choose another time."
      : error.message;
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, held_until, appointment_timestamp, buffer_end_timestamp")
    .eq("id", data)
    .single();

  return NextResponse.json({ booking });
}
