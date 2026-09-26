import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/types";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { CsvSyncForm } from "./CsvSyncForm";
import { Badge } from "@/components/ui/Badge";

async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("price", { ascending: true });
  return (data ?? []) as Service[];
}

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-neon-silver">Services</h1>
        <p className="mt-1 text-sm text-muted-gray">
          Pricing, durations, and hours sync from the shop&apos;s CSV file.
        </p>
      </div>

      <CsvSyncForm />

      <div className="overflow-x-auto rounded-xl border border-border-slate">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-surface-charcoal text-xs uppercase tracking-wide text-muted-gray">
            <tr>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t border-border-slate">
                <td className="px-4 py-3 text-neon-silver">
                  {service.service_name}
                </td>
                <td className="px-4 py-3 text-muted-gray">
                  {formatDuration(service.duration_mins)}
                </td>
                <td className="px-4 py-3 font-mono text-savage-gold">
                  {formatCurrency(service.price)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={service.is_active ? "success" : "neutral"}>
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
