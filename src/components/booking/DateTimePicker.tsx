"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

interface FetchResult {
  key: string;
  slots: string[];
  error: string | null;
}

export function DateTimePicker({
  serviceId,
  selectedSlot,
  onSelectSlot,
}: {
  serviceId: number;
  selectedSlot: string | null;
  onSelectSlot: (isoString: string) => void;
}) {
  const days = useMemo(() => nextDays(14), []);
  const [selectedDate, setSelectedDate] = useState(
    days[0].toISOString().slice(0, 10)
  );
  const requestKey = `${serviceId}:${selectedDate}`;

  // Keyed by requestKey so we never need a synchronous setState at the top
  // of the effect just to flip on a loading flag — "loading" is simply
  // "we don't have a result for the current key yet".
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/availability?serviceId=${serviceId}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setResult({
          key: requestKey,
          slots: data.slots ?? [],
          error: data.error ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            slots: [],
            error: "Couldn't load available times. Try again.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, selectedDate, requestKey]);

  const isCurrent = result?.key === requestKey;
  const loading = !isCurrent;
  const slots = isCurrent ? result.slots : [];
  const error = isCurrent ? result.error : null;

  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const value = day.toISOString().slice(0, 10);
          const isSelected = value === selectedDate;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedDate(value)}
              className={cn(
                "flex min-w-[64px] flex-col items-center rounded-lg border px-3 py-2 transition-colors",
                isSelected
                  ? "border-savage-gold bg-surface-charcoal text-savage-gold"
                  : "border-border-slate bg-surface-charcoal text-muted-gray hover:border-muted-gray"
              )}
            >
              <span className="text-[11px] uppercase tracking-wide">
                {day.toLocaleDateString("en-GH", { weekday: "short" })}
              </span>
              <span className="mt-1 text-lg font-semibold">{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div
          className="grid grid-cols-3 gap-2 sm:grid-cols-4"
          aria-busy="true"
          aria-label="Loading available times"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-lg border border-border-slate bg-surface-charcoal"
            />
          ))}
        </div>
      )}
      {error && <p className="text-sm text-error-red">{error}</p>}
      {!loading && !error && slots.length === 0 && (
        <p className="text-sm text-muted-gray">
          No open slots this day — try another date.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const isSelected = slot === selectedSlot;
          const time = new Date(slot).toLocaleTimeString("en-GH", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className={cn(
                "rounded-lg border px-2 py-2.5 font-mono text-sm font-semibold transition-colors",
                isSelected
                  ? "border-savage-gold bg-savage-gold text-void-black"
                  : "border-border-slate bg-surface-charcoal text-neon-silver hover:border-muted-gray"
              )}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
