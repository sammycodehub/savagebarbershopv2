import type { OperatingHours } from "@/types";
import { DAY_LABELS } from "@/lib/utils";

function getStatus(hours: OperatingHours[]) {
  const now = new Date();
  const today = hours.find((h) => h.day_of_week === now.getDay());

  if (!today || today.is_closed) {
    return { isOpen: false, label: "Closed today" };
  }

  const [openH, openM] = today.open_time.split(":").map(Number);
  const [closeH, closeM] = today.close_time.split(":").map(Number);
  const openMins = openH * 60 + openM;
  const closeMins = closeH * 60 + closeM;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const isOpen = nowMins >= openMins && nowMins < closeMins;
  const openLabel = today.open_time.slice(0, 5);
  const closeLabel = today.close_time.slice(0, 5);

  return {
    isOpen,
    label: isOpen
      ? `Open now · closes ${closeLabel}`
      : `Closed · opens ${openLabel}`,
  };
}

export function OperatingHoursBanner({ hours }: { hours: OperatingHours[] }) {
  if (hours.length === 0) return null;

  const { isOpen, label } = getStatus(hours);

  return (
    <div className="border-b border-border-slate bg-surface-charcoal">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isOpen ? "bg-success-green" : "bg-error-red"
            }`}
            aria-hidden="true"
          />
          <span className="text-neon-silver">{label}</span>
        </div>
        <details className="text-muted-gray">
          <summary className="cursor-pointer list-none underline decoration-border-slate underline-offset-4 hover:text-neon-silver">
            Full hours
          </summary>
          <div className="mt-2 grid gap-1 font-mono text-xs">
            {hours
              .slice()
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((h) => (
                <div key={h.id} className="flex justify-between gap-6">
                  <span>{DAY_LABELS[h.day_of_week]}</span>
                  <span>
                    {h.is_closed
                      ? "Closed"
                      : `${h.open_time.slice(0, 5)} – ${h.close_time.slice(0, 5)}`}
                  </span>
                </div>
              ))}
          </div>
        </details>
      </div>
    </div>
  );
}
