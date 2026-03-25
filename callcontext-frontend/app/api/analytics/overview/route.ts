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
  const startDateStr = startDate.toISOString();

  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - days);
  const previousStartDateStr = previousStartDate.toISOString();

  const [
    currentCallsResult,
    previousCallsResult,
    currentCustomersResult,
    previousCustomersResult,
    currentAnsweredResult,
    currentTotalCallsResult,
    currentDurationsResult,
    previousDurationsResult,
  ] = await Promise.all([
    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", access.shop.id)
      .gte("started_at", startDateStr),

    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", access.shop.id)
      .gte("started_at", previousStartDateStr)
      .lt("started_at", startDateStr),

    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", access.shop.id)
      .gte("created_at", startDateStr),

    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", access.shop.id)
      .gte("created_at", previousStartDateStr)
      .lt("created_at", startDateStr),

    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", access.shop.id)
      .eq("status", "completed")
      .gte("started_at", startDateStr),

    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", access.shop.id)
      .gte("started_at", startDateStr),

    supabase
      .from("calls")
      .select("duration_seconds")
      .eq("shop_id", access.shop.id)
      .not("duration_seconds", "is", null)
      .gte("started_at", startDateStr),

    supabase
      .from("calls")
      .select("duration_seconds")
      .eq("shop_id", access.shop.id)
      .not("duration_seconds", "is", null)
      .gte("started_at", previousStartDateStr)
      .lt("started_at", startDateStr),
  ]);

  const currentCalls = currentCallsResult.count || 0;
  const previousCalls = previousCallsResult.count || 0;
  const currentCustomers = currentCustomersResult.count || 0;
  const previousCustomers = previousCustomersResult.count || 0;
  const answeredCalls = currentAnsweredResult.count || 0;
  const totalCalls = currentTotalCallsResult.count || 0;

  const currentDurations = currentDurationsResult.data || [];
  const previousDurations = previousDurationsResult.data || [];

  const avgDurationCurrent =
    currentDurations.length > 0
      ? currentDurations.reduce(
          (sum, call) => sum + (call.duration_seconds || 0),
          0
        ) / currentDurations.length
      : 0;

  const avgDurationPrevious =
    previousDurations.length > 0
      ? previousDurations.reduce(
          (sum, call) => sum + (call.duration_seconds || 0),
          0
        ) / previousDurations.length
      : 0;

  const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return NextResponse.json({
    current: {
      totalCalls: currentCalls,
      newCustomers: currentCustomers,
      answerRate: Math.round(answerRate),
      avgDuration: Math.round(avgDurationCurrent),
    },
    previous: {
      totalCalls: previousCalls,
      newCustomers: previousCustomers,
      answerRate: 0,
      avgDuration: Math.round(avgDurationPrevious),
    },
    changes: {
      totalCalls: calculateChange(currentCalls, previousCalls),
      newCustomers: calculateChange(currentCustomers, previousCustomers),
      answerRate: 0,
      avgDuration: calculateChange(avgDurationCurrent, avgDurationPrevious),
    },
  });
}
