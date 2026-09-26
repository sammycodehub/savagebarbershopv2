import Link from "next/link";
import Image from "next/image";
import { Scissors } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border-slate">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(212,175,55,0.55) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div className="relative z-10 flex flex-col items-start gap-6">
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
            barber gets the full booking on WhatsApp the moment you confirm
            no missed calls, no guessing.
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-xl bg-savage-gold px-7 py-4 text-base font-semibold text-void-black transition-all hover:scale-[1.02] hover:bg-gold-hover hover:shadow-[0_0_24px_-6px_rgba(212,175,55,0.6)]"
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

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border-slate sm:aspect-[5/6] lg:aspect-[4/5] lg:min-h-[540px]">
          <Image
            src="/images/hero-barber.jpg"
            alt="Barber giving a client a close shave at Savage Lifestyle Barber Shop"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void-black via-void-black/35 to-transparent lg:bg-gradient-to-l lg:from-void-black/20 lg:via-transparent lg:to-void-black/50"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
