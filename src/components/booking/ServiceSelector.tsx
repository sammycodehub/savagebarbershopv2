"use client";

import type { Service } from "@/types";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";
import { Check } from "lucide-react";

export function ServiceSelector({
  services,
  selectedId,
  onSelect,
}: {
  services: Service[];
  selectedId: number | null;
  onSelect: (service: Service) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const isSelected = service.id === selectedId;
        return (
          <button
            key={service.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(service)}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
              isSelected
                ? "border-2 border-savage-gold bg-savage-gold/10 shadow-[0_0_20px_-8px_rgba(212,175,55,0.7)]"
                : "border-border-slate bg-surface-charcoal hover:border-muted-gray"
            )}
          >
            <div>
              <p className="font-medium text-neon-silver">
                {service.service_name}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-gray">
                {formatDuration(service.duration_mins)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-mono text-base font-semibold text-savage-gold">
                {formatCurrency(service.price)}
              </span>
              {isSelected && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-savage-gold">
                  <Check size={14} aria-hidden="true" />
                  Selected
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
