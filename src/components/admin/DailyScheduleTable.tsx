import type { Booking, Service } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDateTimeLabel } from "@/lib/utils";

type BookingRow = Booking & { service: Service };

const statusTone = {
  held: "warning",
  confirmed: "success",
  completed: "neutral",
  cancelled: "error",
} as const;

export function DailyScheduleTable({ bookings }: { bookings: BookingRow[] }) {
  if (bookings.length === 0) {
    return (
      <p className="rounded-xl border border-border-slate bg-surface-charcoal p-6 text-sm text-muted-gray">
        No bookings scheduled. New confirmations will show up here as clients
        book online.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-slate">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface-charcoal text-xs uppercase tracking-wide text-muted-gray">
          <tr>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Client</th>
            <th className="px-4 py-3 font-medium">Service</th>
            <th className="px-4 py-3 font-medium">Payment</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-t border-border-slate">
              <td className="px-4 py-3 font-mono text-neon-silver">
                {formatDateTimeLabel(booking.appointment_timestamp)}
              </td>
              <td className="px-4 py-3 text-neon-silver">
                {booking.guest_name ?? "Registered client"}
              </td>
              <td className="px-4 py-3 text-muted-gray">
                {booking.service.service_name}
              </td>
              <td className="px-4 py-3 text-muted-gray">
                {booking.payment_method === "pay_online" ? "Online" : "In person"}
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTone[booking.status]}>{booking.status}</Badge>
              </td>
              <td className="px-4 py-3 text-right font-mono text-savage-gold">
                {formatCurrency(booking.service.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
