import { Hero } from "@/components/landing/Hero";
import { ServicesList } from "@/components/landing/ServicesList";
import { OperatingHoursBanner } from "@/components/landing/OperatingHoursBanner";
import { createClient } from "@/lib/supabase/server";
import type { OperatingHours, Service } from "@/types";

// Incremental Static Regeneration: revalidate every 5 minutes so pricing/hours
// stay fresh for local SEO without hitting Supabase on every request.
export const revalidate = 300;

async function getLandingData() {
  const supabase = await createClient();

  const [{ data: services }, { data: hours }] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true }),
    supabase.from("operating_hours").select("*"),
  ]);

  return {
    services: (services ?? []) as Service[],
    hours: (hours ?? []) as OperatingHours[],
  };
}

export default async function LandingPage() {
  const { services, hours } = await getLandingData();

  return (
    <main>
      <OperatingHoursBanner hours={hours} />
      <Hero />
      <ServicesList services={services} />

      <footer className="border-t border-border-slate">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-10 text-sm text-muted-gray">
          <p>Savage Lifestyle Barber Shop · Accra</p>
          <a href="/admin/login" className="hover:text-neon-silver">
            
          </a>
        </div>
      </footer>
    </main>
  );
}


