import { createClient } from "@/lib/supabase/server";
import type { OperatingHours } from "@/types";
import { OperatingHoursEditor } from "@/components/admin/OperatingHoursEditor";

async function getHours(): Promise<OperatingHours[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("operating_hours").select("*");
  return (data ?? []) as OperatingHours[];
}

export default async function AdminSchedulePage() {
  const hours = await getHours();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-neon-silver">
          Operating hours
        </h1>
        <p className="mt-1 text-sm text-muted-gray">
          Toggle days on or off and adjust opening times. Changes apply
          immediately to the booking calendar.
        </p>
      </div>
      <OperatingHoursEditor hours={hours} />
    </div>
  );
}
