import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { initializePaystackTransaction } from "@/lib/paystack";

interface InitializeBody {
  bookingId: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as InitializeBody;
  const { bookingId, email, fullName, phoneNumber } = body;

  if (!bookingId || !email) {
    return NextResponse.json(
      { error: "bookingId and email are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*, service:services(*)")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "held") {
    return NextResponse.json(
      { error: "This slot is no longer held. Please start again." },
      { status: 409 }
    );
  }

  if (booking.held_until && new Date(booking.held_until) < new Date()) {
    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    return NextResponse.json(
      { error: "This hold has expired. Please choose another time." },
      { status: 410 }
    );
  }

  if (fullName && !booking.customer_id) {
    await supabase
      .from("bookings")
      .update({ guest_name: fullName, guest_phone: phoneNumber ?? booking.guest_phone })
      .eq("id", bookingId);
  }

  const reference = `slb_${bookingId}_${Date.now()}`;
  const amountInSubunits = Math.round(Number(booking.service.price) * 100);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  try {
    const transaction = await initializePaystackTransaction({
      email,
      amountInSubunits,
      reference,
      callbackUrl: `${appUrl}/booking/success?booking=${bookingId}&reference=${reference}`,
      metadata: { bookingId },
    });

    await supabase.from("payments").insert({
      booking_id: bookingId,
      paystack_reference: reference,
      amount: booking.service.price,
      currency: "GHS",
      status: "pending",
    });

    return NextResponse.json({ authorizationUrl: transaction.authorization_url });
  } catch (error) {
    console.error("Paystack initialization failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to start payment";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
