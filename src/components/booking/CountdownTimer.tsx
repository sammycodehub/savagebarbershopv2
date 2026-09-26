"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/utils";

export function CountdownTimer({
  heldUntil,
  onExpire,
}: {
  heldUntil: string;
  onExpire: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(heldUntil).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(heldUntil).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [heldUntil, onExpire]);

  const isUrgent = secondsLeft <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold ${
        isUrgent
          ? "border-warning-amber/40 bg-warning-amber/10 text-warning-amber"
          : "border-border-slate bg-surface-charcoal text-neon-silver"
      }`}
    >
      Slot held · {formatCountdown(secondsLeft)}
    </div>
  );
}
