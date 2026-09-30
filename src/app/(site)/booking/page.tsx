import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/types";
import { BookingFlow } from "./BookingFlow";

async function getServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });
  return (data ?? []) as Service[];
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [services, { service }] = await Promise.all([
    getServices(),
    searchParams,
  ]);

  const preselectedId = service ? Number(service) : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 text-[32px] font-semibold text-neon-silver">
        Book your cut
      </h1>
      <p className="mb-10 text-muted-gray">
        Pick a service and a time, we&apos;ll hold your slot for 10 minutes
        while you finish checking out.
      </p>
      <BookingFlow services={services} preselectedId={preselectedId} />
    </main>
  );
}
