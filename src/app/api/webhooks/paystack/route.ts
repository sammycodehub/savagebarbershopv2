import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackSignature } from "@/lib/paystack";

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    gateway_response?: string;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  const isValid = await verifyPaystackSignature(rawBody, signature);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as PaystackEvent;
  const supabase = createAdminClient();

  if (payload.event === "charge.success") {
    const { reference } = payload.data;

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("paystack_reference", reference)
      .single();

    if (payment && payment.status === "pending") {
      await supabase
        .from("payments")
        .update({ status: "success", gateway_response: payload.data })
        .eq("paystack_reference", reference);

      await supabase
        .from("bookings")
        .update({ status: "confirmed", held_until: null })
        .eq("id", payment.booking_id);
    }
  }

  if (payload.event === "charge.failed") {
    const { reference } = payload.data;

    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("paystack_reference", reference)
      .single();

    if (payment && payment.status === "pending") {
      await supabase
        .from("payments")
        .update({ status: "failed", gateway_response: payload.data })
        .eq("paystack_reference", reference);

      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", payment.booking_id);
    }
  }

  return NextResponse.json({ received: true });
}
