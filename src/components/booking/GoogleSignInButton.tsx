"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function GoogleSignInButton({ redirectTo }: { redirectTo: string }) {
  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          redirectTo
        )}`,
      },
    });
  };

  return (
    <Button type="button" variant="secondary" onClick={handleSignIn} className="w-full">
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.1 6.62 3.48 9 3.48z"
        />
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.85 2.07-1.81 2.71v2.26h2.92c1.71-1.57 2.69-3.89 2.69-6.61z"
        />
        <path
          fill="#FBBC05"
          d="M3.87 10.78A5.4 5.4 0 013.6 9c0-.62.11-1.22.27-1.78V4.96H.96A9 9 0 000 9c0 1.45.35 2.83.96 4.04l2.91-2.26z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.87-3.04.87-2.38 0-4.4-1.62-5.13-3.79L.96 12.96C2.44 15.98 5.48 18 9 18z"
        />
      </svg>
      Continue with Google
    </Button>
  );
}
