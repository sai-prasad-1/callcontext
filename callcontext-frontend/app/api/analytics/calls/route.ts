import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const querySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "custom"]).default("30d"),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

function calculateDateRange(period: string, date_from?: string, date_to?: string) {
  const now = new Date();
  let from: Date;
  let to: Date = now;

  if (period === "custom" && date_from && date_to) {
    from = new Date(date_from);
    to = new Date(date_to);
  } else {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    from = new Date(now);
    from.setDate(from.getDate() - days);
  }

  return { from: from.toISOString(), to: to.toISOString() };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getDashboardAccess(supabase, user.id);
  if (!access) {
    return NextResponse.json({ error: "No shop" }, { status: 404 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const { period, date_from, date_to } = parsed.data;
  const { from, to } = calculateDateRange(period, date_from, date_to);

  try {
    const { data: calls, error } = await supabase
      .from("calls")
      .select("started_at, status, duration_seconds, sentiment")
      .eq("shop_id", access.shop.id)
      .gte("started_at", from)
      .lte("started_at", to);

    if (error) throw error;

    type CallAnalytics = {
      started_at: string;
      status: string;
      duration_seconds: number | null;
      sentiment: string | null;
    };

    const callsData: CallAnalytics[] = calls ?? [];

    const dailyVolumeMap = new Map<string, number>();
    callsData.forEach((call) => {
      const date = call.started_at.split("T")[0];
      dailyVolumeMap.set(date, (dailyVolumeMap.get(date) ?? 0) + 1);
    });

    const daily_volume = Array.from(dailyVolumeMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    callsData.forEach((call) => {
      const date = new Date(call.started_at);
      const dayOfWeek = date.getUTCDay();
      const hour = date.getUTCHours();
      heatmap[dayOfWeek][hour]++;
    });

    const sentiment = {
      positive: callsData.filter((c) => c.sentiment === "positive").length,
      neutral: callsData.filter((c) => c.sentiment === "neutral").length,
      negative: callsData.filter((c) => c.sentiment === "negative").length,
    };

    const completedCalls = callsData.filter((c) => c.status === "completed" && c.duration_seconds);
    const avg_duration =
      completedCalls.length > 0
        ? completedCalls.reduce((sum, c) => sum + (c.duration_seconds ?? 0), 0) / completedCalls.length
        : 0;

    const completion_rate = callsData.length > 0 ? (completedCalls.length / callsData.length) * 100 : 0;

    return NextResponse.json({
      daily_volume,
      heatmap,
      sentiment,
      avg_duration,
      completion_rate,
    });
  } catch (error) {
    console.error("GET /api/analytics/calls:", error);
    return NextResponse.json({ error: "Failed to load call analytics" }, { status: 500 });
  }
}
