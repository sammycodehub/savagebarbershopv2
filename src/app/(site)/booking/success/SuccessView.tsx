"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import type { Booking, Service } from "@/types";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { formatCurrency, formatDateTimeLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type BookingWithService = Booking & { service: Service };
type ViewState = "loading" | "confirmed" | "failed";

export function SuccessView({
  bookingId,
  reference,
}: {
  bookingId: string;
  reference?: string;
}) {
  const [state, setState] = useState<ViewState>("loading");
  const [booking, setBooking] = useState<BookingWithService | null>(null);

  useEffect(() => {
    async function load() {
      if (reference) {
        await fetch(`/api/payments/verify?reference=${reference}`).catch(() => null);
      }

      const res = await fetch(`/api/bookings/${bookingId}`);
      const data = await res.json();
      if (!res.ok) {
        setState("failed");
        return;
      }
      setBooking(data.booking);
      setState(data.booking.status === "confirmed" ? "confirmed" : "failed");
    }
    load();
  }, [bookingId, reference]);

  if (state === "loading") {
    return <p className="text-center text-muted-gray">Confirming your booking…</p>;
  }

  if (state === "failed") {
    return (
      <div className="text-center">
        <XCircle className="mx-auto mb-4 text-error-red" size={48} />
        <h1 className="text-xl font-semibold text-neon-silver">
          Payment failed. Please try again
        </h1>
        <p className="mt-2 text-sm text-muted-gray">
          Your slot hold was released. No charge was made.
        </p>
        <a
          href="/booking"
          className="mt-6 inline-block rounded-xl bg-savage-gold px-6 py-3 font-semibold text-void-black hover:bg-gold-hover"
        >
          Try again
        </a>
      </div>
    );
  }

  if (!booking) return null;

  const whatsappLink = buildWhatsAppLink({
    customerName: booking.guest_name ?? "Customer",
    phoneNumber: booking.guest_phone ?? "",
    serviceName: booking.service.service_name,
    dateTimeLabel: formatDateTimeLabel(booking.appointment_timestamp),
    totalPrice: booking.service.price,
    paymentStatus:
      booking.payment_method === "pay_online" ? "Paid Online" : "Pay in Person",
  });

  return (
    <div className="text-center">
      <CheckCircle2 className="mx-auto mb-4 text-success-green" size={48} />
      <h1 className="text-xl font-semibold text-neon-silver">Booking confirmed</h1>
      <p className="mt-2 text-sm text-muted-gray">
        We&apos;ve got you down, see you then.
      </p>

      <div className="mt-6 rounded-xl border border-border-slate bg-surface-charcoal p-5 text-left">
        <p className="font-medium text-neon-silver">{booking.service.service_name}</p>
        <p className="mt-1 text-sm text-muted-gray">
          {formatDateTimeLabel(booking.appointment_timestamp)}
        </p>
        <p className="mt-2 font-mono text-lg font-semibold text-savage-gold">
          {formatCurrency(booking.service.price)}
        </p>
        <p className="mt-1 text-sm text-muted-gray">
          {booking.payment_method === "pay_online" ? "Paid online" : "Pay in person"}
        </p>
      </div>

      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="mt-6 block">
        <Button size="lg" className="w-full">
          <MessageCircle size={18} />
          Message barber on WhatsApp
        </Button>
      </a>
    </div>
  );
}
