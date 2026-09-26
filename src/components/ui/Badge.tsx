import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeTone = "gold" | "success" | "warning" | "error" | "neutral";

const toneStyles: Record<BadgeTone, string> = {
  gold: "bg-savage-gold/15 text-savage-gold border-savage-gold/30",
  success: "bg-success-green/15 text-success-green border-success-green/30",
  warning: "bg-warning-amber/15 text-warning-amber border-warning-amber/30",
  error: "bg-error-red/15 text-error-red border-error-red/30",
  neutral: "bg-muted-gray/15 text-muted-gray border-muted-gray/30",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneStyles[tone]
      )}
    >
      {children}
    </span>
  );
}
