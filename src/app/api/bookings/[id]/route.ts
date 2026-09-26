import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, service:services(*)")
    .eq("id", id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}

interface PatchBody {
  fullName?: string;
  phoneNumber?: string;
  paymentMethod?: "pay_online" | "pay_in_person";
  /** Set to true to finalize a "pay in person" booking straight to confirmed */
  confirmPayInPerson?: boolean;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = (await request.json()) as PatchBody;
  const supabase = createAdminClient();

  const { data: current, error: fetchError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !current) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (current.status !== "held") {
    return NextResponse.json(
      { error: "This booking is no longer held" },
      { status: 409 }
    );
  }

  if (current.held_until && new Date(current.held_until) < new Date()) {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    return NextResponse.json(
      { error: "This hold has expired. Please choose another time." },
      { status: 410 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (body.fullName && !current.customer_id) updates.guest_name = body.fullName;
  if (body.phoneNumber && !current.customer_id)
    updates.guest_phone = body.phoneNumber;
  if (body.paymentMethod) updates.payment_method = body.paymentMethod;

  // Signed-in customers: keep their phone number current on the profile
  // (used for the WhatsApp payload) rather than on the booking row.
  if (body.phoneNumber && current.customer_id) {
    await supabase
      .from("profiles")
      .update({ phone_number: body.phoneNumber })
      .eq("id", current.customer_id);
  }

  if (body.confirmPayInPerson) {
    if (current.payment_method !== "pay_in_person") {
      return NextResponse.json(
        { error: "This booking is set up for online payment" },
        { status: 400 }
      );
    }
    updates.status = "confirmed";
    updates.held_until = null;
  }

  const { data: updated, error: updateError } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select("*, service:services(*)")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ booking: updated });
}
