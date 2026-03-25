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
    const [newCustomersResult, allCustomersResult, callCountsResult] = await Promise.all([
      supabase
        .from("customers")
        .select("created_at")
        .eq("shop_id", access.shop.id)
        .gte("created_at", from)
        .lte("created_at", to),

      supabase
        .from("customers")
        .select("id, first_name, last_name, phone, lifetime_value, total_orders")
        .eq("shop_id", access.shop.id),

      supabase
        .from("calls")
        .select("customer_id")
        .eq("shop_id", access.shop.id)
        .not("customer_id", "is", null),
    ]);

    if (newCustomersResult.error) throw newCustomersResult.error;
    if (allCustomersResult.error) throw allCustomersResult.error;
    if (callCountsResult.error) throw callCountsResult.error;

    type NewCustomer = { created_at: string };
    type CustomerData = {
      id: string;
      first_name: string | null;
      last_name: string | null;
      phone: string;
      lifetime_value: number;
      total_orders: number;
    };
    type CallData = { customer_id: string | null };

    const newCustomers: NewCustomer[] = newCustomersResult.data ?? [];
    const allCustomers: CustomerData[] = allCustomersResult.data ?? [];
    const allCalls: CallData[] = callCountsResult.data ?? [];

    const dailyNewMap = new Map<string, number>();
    newCustomers.forEach((customer) => {
      const date = customer.created_at.split("T")[0];
      dailyNewMap.set(date, (dailyNewMap.get(date) ?? 0) + 1);
    });

    const daily_new = Array.from(dailyNewMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const callCountsByCustomer = new Map<string, number>();
    allCalls.forEach((call) => {
      if (call.customer_id) {
        callCountsByCustomer.set(call.customer_id, (callCountsByCustomer.get(call.customer_id) ?? 0) + 1);
      }
    });

    const customersWithCalls = allCustomers
      .map((customer) => ({
        customer: {
          id: customer.id,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
        },
        call_count: callCountsByCustomer.get(customer.id) ?? 0,
        order_count: customer.total_orders,
        lifetime_value: customer.lifetime_value,
      }))
      .filter((c) => c.call_count > 0);

    const top_by_calls = customersWithCalls
      .sort((a, b) => b.call_count - a.call_count)
      .slice(0, 10);

    const top_by_ltv = customersWithCalls
      .sort((a, b) => b.lifetime_value - a.lifetime_value)
      .slice(0, 10);

    const totalCustomers = allCustomers.length;
    const returningCustomers = Array.from(callCountsByCustomer.values()).filter((count) => count > 1).length;
    const returning_rate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    return NextResponse.json({
      daily_new,
      top_by_calls,
      top_by_ltv,
      returning_rate,
    });
  } catch (error) {
    console.error("GET /api/analytics/customers:", error);
    return NextResponse.json({ error: "Failed to load customer analytics" }, { status: 500 });
  }
}
