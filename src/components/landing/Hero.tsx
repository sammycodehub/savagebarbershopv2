import Link from "next/link";
import { Scissors } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border-slate">
      {/* Subtle radial glow, single orchestrated accent rather than scattered decoration */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.55) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-24 sm:py-32">
        <div className="flex items-center gap-2 text-savage-gold">
          <Scissors size={18} />
          <span className="text-sm font-medium tracking-wide">
            Accra&apos;s premium cut, on your schedule
          </span>
        </div>

        <h1 className="max-w-2xl text-[40px] font-bold leading-[1.1] text-neon-silver sm:text-[48px]">
          Savage Lifestyle Barber Shop premium cuts, zero wait.
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-muted-gray">
          Pick a service, lock in a time, and pay however suits you. Your
          barber gets the full booking on WhatsApp the moment you confirm —
          no missed calls, no guessing.
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center rounded-xl bg-savage-gold px-7 py-4 text-base font-semibold text-void-black transition-all hover:bg-gold-hover hover:shadow-[0_0_24px_-6px_rgba(212,175,55,0.6)]"
          >
            Book now
          </Link>
          <a
            href="#services"
            className="inline-flex items-center justify-center rounded-xl border border-border-slate px-7 py-4 text-base font-semibold text-neon-silver transition-colors hover:border-muted-gray hover:bg-surface-charcoal"
          >
            View services
          </a>
        </div>
      </div>
    </section>
  );
}
