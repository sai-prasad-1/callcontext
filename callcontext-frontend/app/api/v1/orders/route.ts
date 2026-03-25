import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { withApiKeyAuth, type ApiContext } from "../middleware";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const createOrderSchema = z.object({
  customer_id: z.string().uuid(),
  items: z.array(
    z.object({
      product_name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
  notes: z.string().optional(),
  shipping_address: z.string().optional(),
});

async function handleGet(request: NextRequest, context: ApiContext) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") ?? 20)));
  const status = params.get("status")?.trim() || null;
  const customerId = params.get("customer_id")?.trim() || null;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("shop_id", context.shopId);

  if (status) {
    query = query.eq("status", status);
  }

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }

  query = query
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data: orders, count, error } = await query;

  if (error) {
    console.error("GET /api/v1/orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    orders: orders ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

async function handlePost(request: NextRequest, context: ApiContext) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = createOrderSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { customer_id, items, notes, shipping_address } = validation.data;

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const orderData = {
    shop_id: context.shopId,
    customer_id,
    items,
    total,
    notes,
    shipping_address,
    status: "pending" as const,
  };

  const { data: order, error } = await supabase
    .from("orders")
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error("POST /api/v1/orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order }, { status: 201 });
}

export const GET = withApiKeyAuth(handleGet);
export const POST = withApiKeyAuth(handlePost);
