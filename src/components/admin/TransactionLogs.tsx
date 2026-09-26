import type { Payment } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTimeLabel } from "@/lib/utils";

const statusTone = {
  pending: "warning",
  success: "success",
  failed: "error",
  abandoned: "neutral",
} as const;

export function TransactionLogs({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <p className="rounded-xl border border-border-slate bg-surface-charcoal p-6 text-sm text-muted-gray">
        No online transactions yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-slate">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-surface-charcoal text-xs uppercase tracking-wide text-muted-gray">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-t border-border-slate">
              <td className="px-4 py-3 font-mono text-xs text-neon-silver">
                {payment.paystack_reference}
              </td>
              <td className="px-4 py-3 text-muted-gray">
                {formatDateTimeLabel(payment.created_at)}
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTone[payment.status]}>{payment.status}</Badge>
              </td>
              <td className="px-4 py-3 text-right font-mono text-savage-gold">
                {formatCurrency(payment.amount, payment.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
