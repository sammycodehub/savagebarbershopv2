import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm text-muted-gray"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-border-slate bg-surface-charcoal px-4 py-3 text-[15px] text-neon-silver placeholder:text-muted-gray/70",
            "focus:border-savage-gold focus:outline-none transition-colors",
            error && "border-error-red focus:border-error-red",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-sm text-error-red">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
