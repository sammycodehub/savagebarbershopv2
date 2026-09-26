import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CsvRow {
  service_id: string;
  service_name: string;
  duration_mins: string;
  price: string;
  day_of_week: string;
  open_time: string;
  close_time: string;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? user : null;
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { rows } = (await request.json()) as { rows: CsvRow[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows to sync" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Services: one row per unique service_id
  const servicesById = new Map<string, CsvRow>();
  for (const row of rows) {
    if (row.service_id && !servicesById.has(row.service_id)) {
      servicesById.set(row.service_id, row);
    }
  }

  const serviceUpserts = Array.from(servicesById.values()).map((row) => ({
    service_id_csv: row.service_id,
    service_name: row.service_name,
    duration_mins: Number(row.duration_mins),
    price: Number(row.price),
    is_active: true,
  }));

  const { error: servicesError } = await supabase
    .from("services")
    .upsert(serviceUpserts, { onConflict: "service_id_csv" });

  if (servicesError) {
    return NextResponse.json({ error: servicesError.message }, { status: 500 });
  }

  // Operating hours: one row per unique day_of_week
  const hoursByDay = new Map<string, CsvRow>();
  for (const row of rows) {
    if (row.day_of_week !== undefined && row.day_of_week !== "" && !hoursByDay.has(row.day_of_week)) {
      hoursByDay.set(row.day_of_week, row);
    }
  }

  if (hoursByDay.size > 0) {
    const hoursUpserts = Array.from(hoursByDay.values()).map((row) => ({
      day_of_week: Number(row.day_of_week),
      open_time: row.open_time,
      close_time: row.close_time,
      is_closed: false,
    }));

    const { error: hoursError } = await supabase
      .from("operating_hours")
      .upsert(hoursUpserts, { onConflict: "day_of_week" });

    if (hoursError) {
      return NextResponse.json({ error: hoursError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    servicesSynced: serviceUpserts.length,
    hoursSynced: hoursByDay.size,
  });
}
