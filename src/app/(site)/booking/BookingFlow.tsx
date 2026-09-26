"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Service } from "@/types";
import { ServiceSelector } from "@/components/booking/ServiceSelector";
import { DateTimePicker } from "@/components/booking/DateTimePicker";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateTimeLabel, formatDuration } from "@/lib/utils";

export function BookingFlow({
  services,
  preselectedId,
}: {
  services: Service[];
  preselectedId: number | null;
}) {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<Service | null>(
    () => services.find((s) => s.id === preselectedId) ?? null
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selectedService || !selectedSlot) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService.id,
          appointmentTimestamp: selectedSlot,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "This slot is temporarily held. Please choose another time.");
        setSubmitting(false);
        return;
      }

      router.push(`/booking/checkout?booking=${data.booking.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-gray">
          1. Choose a service
        </h2>
        <ServiceSelector
          services={services}
          selectedId={selectedService?.id ?? null}
          onSelect={(service) => {
            setSelectedService(service);
            setSelectedSlot(null);
          }}
        />
      </section>

      {selectedService && (
        <section>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-gray">
            2. Pick a date &amp; time
          </h2>
          <DateTimePicker
            serviceId={selectedService.id}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </section>
      )}

      {selectedService && selectedSlot && (
        <section className="rounded-xl border border-border-slate bg-surface-charcoal p-5">
          <p className="text-sm text-muted-gray">You&apos;re booking</p>
          <p className="mt-1 text-lg font-medium text-neon-silver">
            {selectedService.service_name}
          </p>
          <p className="mt-1 text-sm text-muted-gray">
            {formatDateTimeLabel(selectedSlot)} ·{" "}
            {formatDuration(selectedService.duration_mins)}
          </p>
          <p className="mt-2 font-mono text-xl font-semibold text-savage-gold">
            {formatCurrency(selectedService.price)}
          </p>
        </section>
      )}

      {error && (
        <p className="rounded-lg border border-error-red/30 bg-error-red/10 px-4 py-3 text-sm text-error-red">
          {error}
        </p>
      )}

      <Button
        size="lg"
        disabled={!selectedService || !selectedSlot || submitting}
        onClick={handleContinue}
      >
        {submitting ? "Holding your slot…" : "Continue to checkout"}
      </Button>
    </div>
  );
}
