"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking, PaymentOption, Service } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { CountdownTimer } from "@/components/booking/CountdownTimer";
import { GoogleSignInButton } from "@/components/booking/GoogleSignInButton";
import { PaymentMethodSelector } from "@/components/booking/PaymentMethodSelector";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateTimeLabel } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

type BookingWithService = Booking & { service: Service };

export function CheckoutForm({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithService | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentOption>("pay_in_person");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setLoadError(data.error);
        else setBooking(data.booking);
      })
      .catch(() => setLoadError("Couldn't load your booking."));

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        setFullName(data.user.user_metadata?.full_name ?? data.user.email ?? "");
        setEmail(data.user.email ?? "");
      }
    });
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;
    setFormError(null);

    if (!user && !fullName.trim()) {
      setFormError("Enter your name.");
      return;
    }
    if (!phoneNumber.trim()) {
      setFormError("Enter a phone number so we can reach you.");
      return;
    }
    if (paymentMethod === "pay_online" && !email.trim()) {
      setFormError("Enter an email for the payment receipt.");
      return;
    }

    setSubmitting(true);
    try {
      const patchRes = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          paymentMethod,
        }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok) {
        setFormError(patchData.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      if (paymentMethod === "pay_in_person") {
        const confirmRes = await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirmPayInPerson: true }),
        });
        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) {
          setFormError(confirmData.error ?? "Couldn't confirm your booking.");
          setSubmitting(false);
          return;
        }
        router.push(`/booking/success?booking=${bookingId}`);
        return;
      }

      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          email: email.trim(),
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });
      const payData = await payRes.json();
      if (!payRes.ok) {
        setFormError(payData.error ?? "Couldn't start payment. Please try again.");
        setSubmitting(false);
        return;
      }
      window.location.href = payData.authorizationUrl;
    } catch {
      setFormError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="text-center">
        <p className="text-error-red">{loadError}</p>
        <a href="/booking" className="mt-4 inline-block text-savage-gold underline">
          Start a new booking
        </a>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="text-center">
        <p className="text-warning-amber">
          Your 10-minute hold expired. The slot has been released.
        </p>
        <a href="/booking" className="mt-4 inline-block text-savage-gold underline">
          Choose another time
        </a>
      </div>
    );
  }

  if (!booking) {
    return <p className="text-muted-gray">Loading your booking…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-neon-silver">Checkout</h1>
        <div className="mt-3">
          {booking.held_until && (
            <CountdownTimer
              heldUntil={booking.held_until}
              onExpire={() => setExpired(true)}
            />
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border-slate bg-surface-charcoal p-5">
        <p className="font-medium text-neon-silver">{booking.service.service_name}</p>
        <p className="mt-1 text-sm text-muted-gray">
          {formatDateTimeLabel(booking.appointment_timestamp)}
        </p>
        <p className="mt-2 font-mono text-lg font-semibold text-savage-gold">
          {formatCurrency(booking.service.price)}
        </p>
      </div>

      {!user && (
        <div className="flex flex-col gap-3">
          <GoogleSignInButton redirectTo={`/booking/checkout?booking=${bookingId}`} />
          <div className="flex items-center gap-3 text-xs text-muted-gray">
            <span className="h-px flex-1 bg-border-slate" />
            or continue as a guest
            <span className="h-px flex-1 bg-border-slate" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!user && (
          <Input
            label="Full name"
            name="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Kwame Mensah"
            required
          />
        )}
        <Input
          label="Phone number"
          name="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="024 123 4567"
          required
        />

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-gray">
            Payment
          </h2>
          <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
        </div>

        {paymentMethod === "pay_online" && (
          <Input
            label="Email (for your payment receipt)"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        )}

        {formError && (
          <p className="rounded-lg border border-error-red/30 bg-error-red/10 px-4 py-3 text-sm text-error-red">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting
            ? "Confirming…"
            : paymentMethod === "pay_online"
              ? "Continue to payment"
              : "Confirm booking"}
        </Button>
      </form>
    </div>
  );
}
