"use client";

import type { Service } from "@/types";
import { cn, formatCurrency, formatDuration } from "@/lib/utils";

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
            onClick={() => onSelect(service)}
            className={cn(
              "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
              isSelected
                ? "border-savage-gold bg-surface-charcoal"
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
            <span className="font-mono text-base font-semibold text-savage-gold">
              {formatCurrency(service.price)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
