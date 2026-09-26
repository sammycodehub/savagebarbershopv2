"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: "default" | "lightbox";
  children: ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  size = "default",
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-void-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full rounded-2xl border-t-2 border-savage-gold bg-surface-charcoal shadow-2xl",
          size === "lightbox"
            ? "max-w-4xl p-3 sm:p-4"
            : "max-w-md p-6"
        )}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 text-neon-silver/70 hover:text-neon-silver transition-colors"
        >
          <X size={20} />
        </button>
        {title && (
          <h2 className="mb-4 pr-8 text-xl font-semibold text-neon-silver">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
