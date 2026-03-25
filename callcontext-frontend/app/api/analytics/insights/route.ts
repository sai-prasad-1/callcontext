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

  const [callsResult, customersResult, productsResult] = await Promise.all([
    supabase
      .from("calls")
      .select("started_at, customer_id")
      .eq("shop_id", access.shop.id)
      .gte("started_at", startDate.toISOString()),

    supabase
      .from("customers")
      .select(
        `
        id,
        first_name,
        last_name,
        phone,
        created_at,
        avatar_url,
        calls:calls(id, shop_id),
        orders:orders(id, shop_id, total_amount)
      `
      )
      .eq("shop_id", access.shop.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("calls")
      .select("products_mentioned")
      .eq("shop_id", access.shop.id)
      .gte("started_at", startDate.toISOString())
      .not("products_mentioned", "is", null),
  ]);

  const calls = callsResult.data || [];
  const customers = customersResult.data || [];
  const productCalls = productsResult.data || [];

  const hourlyData: number[][] = Array(7)
    .fill(0)
    .map(() => Array(24).fill(0));

  calls.forEach((call) => {
    const date = new Date(call.started_at);
    const day = date.getDay();
    const hour = date.getHours();
    hourlyData[day][hour]++;
  });

  const customerCallCounts = new Map<string, number>();
  calls.forEach((call) => {
    if (call.customer_id) {
      customerCallCounts.set(
        call.customer_id,
        (customerCallCounts.get(call.customer_id) || 0) + 1
      );
    }
  });

  const topCustomers = customers
    .map((customer) => {
      const callCount =
        customer.calls?.filter((c: any) => c.shop_id === access.shop.id)
          .length || 0;
      const orderCount =
        customer.orders?.filter((o: any) => o.shop_id === access.shop.id)
          .length || 0;
      const lifetimeValue =
        customer.orders
          ?.filter((o: any) => o.shop_id === access.shop.id)
          .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0;

      return {
        id: customer.id,
        name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Unknown",
        phone: customer.phone,
        avatar_url: customer.avatar_url,
        callCount,
        orderCount,
        lifetimeValue,
      };
    })
    .filter((c) => c.callCount > 0)
    .sort((a, b) => b.callCount - a.callCount)
    .slice(0, 10);

  const productMentions = new Map<string, number>();
  productCalls.forEach((call) => {
    const products = call.products_mentioned;
    if (Array.isArray(products)) {
      products.forEach((product: string) => {
        if (product && typeof product === "string") {
          productMentions.set(product, (productMentions.get(product) || 0) + 1);
        }
      });
    }
  });

  const popularProducts = Array.from(productMentions.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const customersByDate = new Map<string, number>();
  const allCustomers = await supabase
    .from("customers")
    .select("created_at")
    .eq("shop_id", access.shop.id)
    .order("created_at", { ascending: true });

  (allCustomers.data || []).forEach((customer) => {
    const dateStr = customer.created_at.split("T")[0];
    customersByDate.set(dateStr, (customersByDate.get(dateStr) || 0) + 1);
  });

  const sortedDates = Array.from(customersByDate.keys()).sort();
  let cumulative = 0;
  const customerGrowth = sortedDates.map((date) => {
    cumulative += customersByDate.get(date) || 0;
    return { date, count: cumulative };
  });

  return NextResponse.json({
    busiestHours: hourlyData,
    topCustomers,
    popularProducts,
    customerGrowth:
      customerGrowth.length > 100
        ? customerGrowth.slice(-100)
        : customerGrowth,
  });
}
