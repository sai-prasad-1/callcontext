import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await loadDashboardAccess(user.id);
  if (!access) {
    return NextResponse.json({ error: "No shop access" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "30");

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const { data: calls } = await supabase
    .from("calls")
    .select("started_at")
    .eq("shop_id", access.shop.id)
    .gte("started_at", startDate.toISOString())
    .order("started_at", { ascending: true });

  const volumeByDate: Record<string, number> = {};

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    volumeByDate[dateStr] = 0;
  }

  (calls || []).forEach((call: { started_at: string }) => {
    const dateStr = call.started_at.split("T")[0];
    if (volumeByDate[dateStr] !== undefined) {
      volumeByDate[dateStr]++;
    }
  });

  const chartData = Object.entries(volumeByDate).map(([date, count]) => ({
    date,
    count,
  }));

  return NextResponse.json(chartData);
}
