"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { LayoutGrid, Scissors, CalendarClock, LogOut } from "lucide-react";

const links = [
  { href: "/admin/dashboard", label: "Schedule", icon: LayoutGrid },
  { href: "/admin/dashboard/services", label: "Services", icon: Scissors },
  { href: "/admin/dashboard/schedule", label: "Hours", icon: CalendarClock },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <nav className="border-b border-border-slate bg-surface-charcoal">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-savage-gold">
            Savage Admin
          </span>
          <div className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-savage-gold/15 text-savage-gold"
                      : "text-muted-gray hover:text-neon-silver"
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-sm text-muted-gray hover:text-neon-silver"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
