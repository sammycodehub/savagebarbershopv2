"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function NavAuthControl() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          pathname
        )}`,
      },
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  // Avoid a flash of "Sign in" before we know the session state.
  if (!checked) {
    return <div className="h-9 w-24" aria-hidden="true" />;
  }

  if (user) {
    const label =
      user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Account";
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-gray sm:inline">
          Hi, {label}
        </span>
        <Button size="sm" variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" variant="secondary" onClick={handleSignIn}>
      Sign in
    </Button>
  );
}
