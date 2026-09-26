"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OperatingHours } from "@/types";
import { DAY_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function OperatingHoursEditor({ hours }: { hours: OperatingHours[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(() => {
    const byDay = new Map(hours.map((h) => [h.day_of_week, h]));
    return Array.from({ length: 7 }, (_, day) => {
      const existing = byDay.get(day);
      return {
        day_of_week: day,
        open_time: existing?.open_time?.slice(0, 5) ?? "09:00",
        close_time: existing?.close_time?.slice(0, 5) ?? "18:00",
        is_closed: existing?.is_closed ?? false,
      };
    });
  });
  const [savingDay, setSavingDay] = useState<number | null>(null);

  const updateRow = (day: number, patch: Partial<(typeof rows)[number]>) => {
    setRows((prev) =>
      prev.map((r) => (r.day_of_week === day ? { ...r, ...patch } : r))
    );
  };

  const saveRow = async (day: number) => {
    const row = rows.find((r) => r.day_of_week === day);
    if (!row) return;
    setSavingDay(day);
    await fetch("/api/admin/hours", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    setSavingDay(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col divide-y divide-border-slate rounded-xl border border-border-slate bg-surface-charcoal">
      {rows.map((row) => (
        <div
          key={row.day_of_week}
          className="flex flex-wrap items-center gap-3 px-4 py-3"
        >
          <span className="w-24 shrink-0 text-sm text-neon-silver">
            {DAY_LABELS[row.day_of_week]}
          </span>

          <button
            type="button"
            onClick={() => updateRow(row.day_of_week, { is_closed: !row.is_closed })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              row.is_closed
                ? "border-error-red/40 bg-error-red/10 text-error-red"
                : "border-success-green/40 bg-success-green/10 text-success-green"
            )}
          >
            {row.is_closed ? "Closed" : "Open"}
          </button>

          {!row.is_closed && (
            <>
              <input
                type="time"
                value={row.open_time}
                onChange={(e) =>
                  updateRow(row.day_of_week, { open_time: e.target.value })
                }
                className="rounded-lg border border-border-slate bg-void-black px-2 py-1.5 font-mono text-sm text-neon-silver focus:border-savage-gold focus:outline-none"
              />
              <span className="text-muted-gray">–</span>
              <input
                type="time"
                value={row.close_time}
                onChange={(e) =>
                  updateRow(row.day_of_week, { close_time: e.target.value })
                }
                className="rounded-lg border border-border-slate bg-void-black px-2 py-1.5 font-mono text-sm text-neon-silver focus:border-savage-gold focus:outline-none"
              />
            </>
          )}

          <Button
            size="sm"
            variant="secondary"
            className="ml-auto"
            onClick={() => saveRow(row.day_of_week)}
            disabled={savingDay === row.day_of_week}
          >
            {savingDay === row.day_of_week ? "Saving…" : "Save"}
          </Button>
        </div>
      ))}
    </div>
  );
}
