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
    const [callsResult, ordersResult] = await Promise.all([
      supabase
        .from("calls")
        .select("entities_extracted")
        .eq("shop_id", access.shop.id)
        .gte("started_at", from)
        .lte("started_at", to)
        .not("entities_extracted", "is", null),

      supabase
        .from("orders")
        .select("products, total_amount")
        .eq("shop_id", access.shop.id)
        .gte("created_at", from)
        .lte("created_at", to),
    ]);

    if (callsResult.error) throw callsResult.error;
    if (ordersResult.error) throw ordersResult.error;

    const calls = callsResult.data ?? [];
    const orders = ordersResult.data ?? [];

    const productMap = new Map<
      string,
      {
        mentions: number;
        revenue: number;
      }
    >();

    calls.forEach((call) => {
      if (call.entities_extracted && typeof call.entities_extracted === "object") {
        const entities = call.entities_extracted as Record<string, unknown>;
        if (entities.products && Array.isArray(entities.products)) {
          entities.products.forEach((product: unknown) => {
            if (typeof product === "string") {
              const name = product.toLowerCase();
              const existing = productMap.get(name) ?? { mentions: 0, revenue: 0 };
              productMap.set(name, { ...existing, mentions: existing.mentions + 1 });
            } else if (typeof product === "object" && product !== null) {
              const productObj = product as Record<string, unknown>;
              const name = (productObj.name ?? productObj.product ?? "").toString().toLowerCase();
              if (name) {
                const existing = productMap.get(name) ?? { mentions: 0, revenue: 0 };
                productMap.set(name, { ...existing, mentions: existing.mentions + 1 });
              }
            }
          });
        }
      }
    });

    orders.forEach((order) => {
      if (order.products && typeof order.products === "object") {
        const products = order.products as Record<string, unknown>;
        if (Array.isArray(products)) {
          products.forEach((product: unknown) => {
            if (typeof product === "object" && product !== null) {
              const productObj = product as Record<string, unknown>;
              const name = (productObj.name ?? productObj.product ?? "").toString().toLowerCase();
              const price = typeof productObj.price === "number" ? productObj.price : 0;
              const quantity = typeof productObj.quantity === "number" ? productObj.quantity : 1;
              
              if (name) {
                const existing = productMap.get(name) ?? { mentions: 0, revenue: 0 };
                productMap.set(name, {
                  mentions: existing.mentions + 1,
                  revenue: existing.revenue + price * quantity,
                });
              }
            }
          });
        } else if (products.items && Array.isArray(products.items)) {
          products.items.forEach((product: unknown) => {
            if (typeof product === "object" && product !== null) {
              const productObj = product as Record<string, unknown>;
              const name = (productObj.name ?? productObj.product ?? "").toString().toLowerCase();
              const price = typeof productObj.price === "number" ? productObj.price : 0;
              const quantity = typeof productObj.quantity === "number" ? productObj.quantity : 1;
              
              if (name) {
                const existing = productMap.get(name) ?? { mentions: 0, revenue: 0 };
                productMap.set(name, {
                  mentions: existing.mentions + 1,
                  revenue: existing.revenue + price * quantity,
                });
              }
            }
          });
        }
      }
    });

    const top_products = Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        mentions: data.mentions,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 10);

    return NextResponse.json({ top_products });
  } catch (error) {
    console.error("GET /api/analytics/products:", error);
    return NextResponse.json({ error: "Failed to load product analytics" }, { status: 500 });
  }
}
