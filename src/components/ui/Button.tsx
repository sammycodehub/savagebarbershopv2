import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-savage-gold text-void-black hover:scale-[1.02] hover:bg-gold-hover hover:shadow-[0_0_24px_-6px_rgba(212,175,55,0.6)] disabled:bg-muted-gray disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100",
  secondary:
    "bg-transparent border border-border-slate text-neon-silver hover:bg-surface-charcoal hover:border-muted-gray disabled:opacity-40 disabled:cursor-not-allowed",
  ghost:
    "bg-transparent text-muted-gray hover:text-neon-silver disabled:opacity-40 disabled:cursor-not-allowed",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm px-3.5 py-2 rounded-lg",
  md: "text-[15px] px-5 py-3 rounded-lg",
  lg: "text-base px-7 py-4 rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
