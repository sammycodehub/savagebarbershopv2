import Link from "next/link";
import { Scissors } from "lucide-react";
import { NavAuthControl } from "./NavAuthControl";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-slate bg-void-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2 text-neon-silver">
          <Scissors size={18} className="text-savage-gold" />
          <span className="font-semibold tracking-tight">Savage Lifestyle</span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/#services"
            className="hidden text-sm text-muted-gray hover:text-neon-silver sm:inline"
          >
            Services
          </Link>
          <Link
            href="/#gallery"
            className="hidden text-sm text-muted-gray hover:text-neon-silver sm:inline"
          >
            Gallery
          </Link>
          <Link
            href="/booking"
            className="hidden text-sm text-muted-gray hover:text-neon-silver sm:inline"
          >
            Book now
          </Link>
          <NavAuthControl />
        </nav>
      </div>
    </header>
  );
}
