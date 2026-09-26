"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Service } from "@/types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function WalkInBlockForm({ services }: { services: Service[] }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? 0);
  const [dateTime, setDateTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateTime) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/walk-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        appointmentTimestamp: new Date(dateTime).toISOString(),
        clientName,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Couldn't block that slot.");
      return;
    }

    setDateTime("");
    setClientName("");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-xl border border-border-slate bg-surface-charcoal p-4"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-muted-gray">Service</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(Number(e.target.value))}
          className="rounded-lg border border-border-slate bg-void-black px-3 py-3 text-sm text-neon-silver focus:border-savage-gold focus:outline-none"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.service_name}
            </option>
          ))}
        </select>
      </div>
      <Input
        label="Date & time"
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        required
      />
      <Input
        label="Client name (optional)"
        value={clientName}
        onChange={(e) => setClientName(e.target.value)}
        placeholder="Walk-in"
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "Blocking…" : "Block slot"}
      </Button>
      {error && <p className="w-full text-sm text-error-red">{error}</p>}
    </form>
  );
}
