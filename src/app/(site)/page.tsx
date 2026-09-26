import { Hero } from "@/components/landing/Hero";
import { ServicesList } from "@/components/landing/ServicesList";
import { Gallery } from "@/components/landing/Gallery";
import { OperatingHoursBanner } from "@/components/landing/OperatingHoursBanner";
import { MobileBookNow } from "@/components/landing/MobileBookNow";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
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
    <main className="pb-24 md:pb-0">
      <OperatingHoursBanner hours={hours} />
      <ScrollReveal>
        <Hero />
      </ScrollReveal>
      <ScrollReveal>
        <ServicesList services={services} />
      </ScrollReveal>
      <ScrollReveal>
        <Gallery />
      </ScrollReveal>
      <ScrollReveal>
        <SiteFooter />
      </ScrollReveal>
      <MobileBookNow />
    </main>
  );
}
