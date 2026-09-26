import Link from "next/link";

export function MobileBookNow() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
      <Link
        href="/booking"
        className="pointer-events-auto mx-auto flex max-w-sm items-center justify-center rounded-xl bg-savage-gold px-6 py-3.5 text-sm font-semibold text-void-black shadow-[0_8px_32px_-8px_rgba(212,175,55,0.7)] transition-all hover:bg-gold-hover"
      >
        Book Now
      </Link>
    </div>
  );
}
