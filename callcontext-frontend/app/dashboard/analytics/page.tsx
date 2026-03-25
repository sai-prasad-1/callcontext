import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { getShopConfig } from "@/lib/utils/shop-config";
import { AnalyticsClient } from "@/components/analytics/AnalyticsClient";
import { redirect } from "next/navigation";

async function fetchAnalyticsData(shopId: string, days: number) {
  const supabase = await createClient();
  
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
    callVolumeResult,
    sentimentResult,
    topCustomersResult,
    customerGrowthResult,
  ] = await Promise.all([
    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shopId)
      .gte("started_at", startDateStr),

    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shopId)
      .gte("started_at", previousStartDateStr)
      .lt("started_at", startDateStr),

    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shopId)
      .gte("created_at", startDateStr),

    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shopId)
      .gte("created_at", previousStartDateStr)
      .lt("created_at", startDateStr),

    supabase
      .from("calls")
      .select("started_at")
      .eq("shop_id", shopId)
      .gte("started_at", startDateStr)
      .order("started_at"),

    supabase
      .from("calls")
      .select("sentiment")
      .eq("shop_id", shopId)
      .not("sentiment", "is", null)
      .gte("started_at", startDateStr),

    supabase
      .from("customers")
      .select("id, first_name, last_name, phone, loyalty_points, lifetime_value")
      .eq("shop_id", shopId)
      .order("lifetime_value", { ascending: false })
      .limit(10),

    supabase
      .from("customers")
      .select("created_at")
      .eq("shop_id", shopId)
      .gte("created_at", startDateStr)
      .order("created_at"),
  ]);

  const currentCalls = currentCallsResult.count || 0;
  const previousCalls = previousCallsResult.count || 0;
  const currentCustomers = currentCustomersResult.count || 0;
  const previousCustomers = previousCustomersResult.count || 0;

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const dailyVolume: { [key: string]: number } = {};
  (callVolumeResult.data || []).forEach((call: any) => {
    const date = new Date(call.started_at).toISOString().split("T")[0];
    dailyVolume[date] = (dailyVolume[date] || 0) + 1;
  });

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  (sentimentResult.data || []).forEach((call: any) => {
    if (call.sentiment) {
      sentimentCounts[call.sentiment as keyof typeof sentimentCounts]++;
    }
  });

  const dailyGrowth: { [key: string]: number } = {};
  (customerGrowthResult.data || []).forEach((customer: any) => {
    const date = new Date(customer.created_at).toISOString().split("T")[0];
    dailyGrowth[date] = (dailyGrowth[date] || 0) + 1;
  });

  return {
    overview: {
      current: {
        totalCalls: currentCalls,
        newCustomers: currentCustomers,
        answerRate: 0,
        avgDuration: 0,
      },
      previous: {
        totalCalls: previousCalls,
        newCustomers: previousCustomers,
        answerRate: 0,
        avgDuration: 0,
      },
      changes: {
        totalCalls: calculateChange(currentCalls, previousCalls),
        newCustomers: calculateChange(currentCustomers, previousCustomers),
        answerRate: 0,
        avgDuration: 0,
      },
    },
    callVolume: Object.entries(dailyVolume).map(([date, count]) => ({
      date,
      count,
    })),
    sentiment: sentimentCounts,
    insights: {
      busiestHours: Array(7).fill(0).map(() => Array(24).fill(0)),
      topCustomers: (topCustomersResult.data || []).map((c: any, i: number) => ({
        rank: i + 1,
        customer: c,
        callCount: 0,
        orderCount: 0,
        lifetimeValue: c.lifetime_value || 0,
      })),
      popularProducts: [],
      customerGrowth: Object.entries(dailyGrowth).map(([date, count]) => ({
        date,
        count,
      })),
    },
  };
}

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await loadDashboardAccess(user.id);
  if (!access) {
    redirect("/dashboard");
  }

  const shopConfig = getShopConfig(access.shop.settings);
  const initialData = await fetchAnalyticsData(access.shop.id, 30);

  return (
    <AnalyticsClient initialData={initialData} shopConfig={shopConfig} />
  );
}
