"use client";

import type { PaymentOption } from "@/types";
import { cn } from "@/lib/utils";
import { Banknote, CreditCard } from "lucide-react";

export function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentOption;
  onChange: (value: PaymentOption) => void;
}) {
  const options: { value: PaymentOption; label: string; description: string; icon: React.ReactNode }[] = [
    {
      value: "pay_in_person",
      label: "Pay in person",
      description: "Cash or card at the shop",
      icon: <Banknote size={20} />,
    },
    {
      value: "pay_online",
      label: "Pay online",
      description: "Secure checkout via Paystack",
      icon: <CreditCard size={20} />,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
              isSelected
                ? "border-savage-gold bg-surface-charcoal text-neon-silver"
                : "border-border-slate bg-transparent text-neon-silver hover:bg-surface-charcoal"
            )}
          >
            <span className={isSelected ? "text-savage-gold" : "text-muted-gray"}>
              {option.icon}
            </span>
            <span>
              <span className="block font-medium">{option.label}</span>
              <span className="block text-sm text-muted-gray">
                {option.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
