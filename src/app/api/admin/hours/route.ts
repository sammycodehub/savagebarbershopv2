import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

interface HoursBody {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = (await request.json()) as HoursBody;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("operating_hours")
    .upsert(
      {
        day_of_week: body.day_of_week,
        open_time: body.open_time,
        close_time: body.close_time,
        is_closed: body.is_closed,
      },
      { onConflict: "day_of_week" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
