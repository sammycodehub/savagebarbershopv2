import { createClient } from "@/lib/supabase/server";
import { DailyScheduleTable } from "@/components/admin/DailyScheduleTable";
import { TransactionLogs } from "@/components/admin/TransactionLogs";
import { WalkInBlockForm } from "@/components/admin/WalkInBlockForm";
import type { Booking, Payment, Service } from "@/types";

async function getDashboardData() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [{ data: bookings }, { data: payments }, { data: services }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*, service:services(*)")
        .gte("appointment_timestamp", todayStart.toISOString())
        .lte("appointment_timestamp", todayEnd.toISOString())
        .in("status", ["confirmed", "held", "completed"])
        .order("appointment_timestamp", { ascending: true }),
      supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("services").select("*").eq("is_active", true),
    ]);

  return {
    bookings: (bookings ?? []) as (Booking & { service: Service })[],
    payments: (payments ?? []) as Payment[],
    services: (services ?? []) as Service[],
  };
}

export default async function AdminDashboardPage() {
  const { bookings, payments, services } = await getDashboardData();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold text-neon-silver">
          Today&apos;s schedule
        </h1>
        <p className="mt-1 text-sm text-muted-gray">
          {new Date().toLocaleDateString("en-GH", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-gray">
          Block a walk-in slot
        </h2>
        <WalkInBlockForm services={services} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-gray">
          Appointments
        </h2>
        <DailyScheduleTable bookings={bookings} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-gray">
          Recent Paystack transactions
        </h2>
        <TransactionLogs payments={payments} />
      </section>
    </div>
  );
}
