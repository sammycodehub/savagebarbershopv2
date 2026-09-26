import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

interface WalkInBody {
  serviceId: number;
  appointmentTimestamp: string;
  clientName?: string;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = (await request.json()) as WalkInBody;
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("hold_booking_slot", {
    p_customer_id: null,
    p_service_id: body.serviceId,
    p_appointment_time: body.appointmentTimestamp,
    p_payment_method: "pay_in_person",
    p_guest_name: body.clientName || "Walk-in",
    p_guest_phone: "N/A",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  await supabase
    .from("bookings")
    .update({ status: "confirmed", held_until: null })
    .eq("id", data);

  return NextResponse.json({ bookingId: data });
}
