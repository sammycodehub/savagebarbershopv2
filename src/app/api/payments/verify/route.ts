import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackTransaction } from "@/lib/paystack";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "reference is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    const result = await verifyPaystackTransaction(reference);

    const { data: payment } = await supabase
      .from("payments")
      .select("*, booking:bookings(*)")
      .eq("paystack_reference", reference)
      .single();

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    // Idempotent: the Paystack webhook may have already reconciled this.
    if (payment.status === "pending") {
      const newStatus =
        result.status === "success"
          ? "success"
          : result.status === "abandoned"
            ? "abandoned"
            : "failed";

      await supabase
        .from("payments")
        .update({ status: newStatus, gateway_response: result })
        .eq("paystack_reference", reference);

      if (newStatus === "success") {
        await supabase
          .from("bookings")
          .update({ status: "confirmed", held_until: null })
          .eq("id", payment.booking_id);
      } else {
        await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", payment.booking_id);
      }
    }

    return NextResponse.json({ status: result.status, bookingId: payment.booking_id });
  } catch (error) {
    console.error("Payment verification failed", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 502 });
  }
}
