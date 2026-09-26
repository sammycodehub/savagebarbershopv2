import Link from "next/link";
import type { Service } from "@/types";
import { formatCurrency, formatDuration } from "@/lib/utils";

export function ServicesList({ services }: { services: Service[] }) {
  if (services.length === 0) {
    return (
      <section id="services" className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-muted-gray">
          Services aren&apos;t loaded yet. Once the CSV is synced from the
          Admin Dashboard, they&apos;ll show up here.
        </p>
      </section>
    );
  }

  return (
    <section id="services" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="mb-2 text-[32px] font-semibold leading-tight text-neon-silver">
        Available services
      </h2>
      <p className="mb-10 max-w-lg text-muted-gray">
        Prices and durations sync straight from the shop&apos;s records — what
        you see here is what you&apos;ll pay.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/booking?service=${service.id}`}
            className="group flex items-center justify-between rounded-xl border border-border-slate bg-surface-charcoal p-5 transition-all hover:-translate-y-px hover:border-savage-gold"
          >
            <div>
              <h3 className="text-xl font-medium text-neon-silver">
                {service.service_name}
              </h3>
              {service.description && (
                <p className="mt-1 text-sm text-muted-gray">
                  {service.description}
                </p>
              )}
              <p className="mt-2 font-mono text-xs text-muted-gray">
                {formatDuration(service.duration_mins)}
              </p>
            </div>
            <span className="whitespace-nowrap font-mono text-lg font-semibold text-savage-gold">
              {formatCurrency(service.price)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
