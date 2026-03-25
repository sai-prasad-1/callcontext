import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  customer_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sort: z.enum(["newest", "oldest", "amount", "delivery"]).default("newest"),
});

const createOrderSchema = z.object({
  customer_id: z.string().uuid(),
  products: z.array(
    z.object({
      name: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().nonnegative(),
    })
  ),
  delivery_date: z.string().optional(),
  delivery_address: z.string().optional(),
  occasion: z.string().optional(),
  special_instructions: z.string().optional(),
  total_amount: z.number().nonnegative().optional(),
  status: z.enum(["pending", "confirmed", "delivered", "cancelled"]).optional(),
});

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

  const { page, limit, status, customer_id, date_from, date_to, sort } = parsed.data;

  let query = supabase
    .from("orders")
    .select("*, customer:customers!customer_id(id, first_name, last_name, phone)", {
      count: "exact",
    })
    .eq("shop_id", access.shop.id);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (date_from) {
    query = query.gte("delivery_date", date_from);
  }

  if (date_to) {
    query = query.lte("delivery_date", date_to);
  }

  if (customer_id) {
    query = query.eq("customer_id", customer_id);
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "amount":
      query = query.order("total_amount", { ascending: false, nullsFirst: false });
      break;
    case "delivery":
      query = query.order("delivery_date", { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: orders, count, error } = await query;

  if (error) {
    console.error("GET /api/orders:", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({ orders: orders ?? [], total, page, totalPages });
}

export async function POST(request: NextRequest) {
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

  let body: z.infer<typeof createOrderSchema>;
  try {
    body = createOrderSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, first_name, last_name, total_orders, lifetime_value")
    .eq("id", body.customer_id)
    .eq("shop_id", access.shop.id)
    .maybeSingle();

  if (!customer) {
    return NextResponse.json(
      { error: "Customer not found or does not belong to your shop" },
      { status: 404 }
    );
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      shop_id: access.shop.id,
      customer_id: body.customer_id,
      products: body.products as never,
      delivery_date: body.delivery_date ?? null,
      delivery_address: body.delivery_address ?? null,
      occasion: body.occasion ?? null,
      special_instructions: body.special_instructions ?? null,
      total_amount: body.total_amount ?? null,
      status: body.status ?? "pending",
    } as never)
    .select()
    .single();

  if (error) {
    console.error("POST /api/orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sideEffects: Promise<unknown>[] = [];

  if (body.total_amount && body.total_amount > 0) {
    sideEffects.push(
      supabase
        .from("customers")
        .update({
          total_orders: (customer.total_orders ?? 0) + 1,
          lifetime_value: (customer.lifetime_value ?? 0) + body.total_amount,
        } as never)
        .eq("id", body.customer_id)
    );
  }

  if (body.delivery_date) {
    const deliveryDate = new Date(body.delivery_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deliveryDate > today) {
      const customerName = [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Customer";

      sideEffects.push(
        supabase.from("reminders").insert({
          shop_id: access.shop.id,
          customer_id: body.customer_id,
          title: `Order delivery: ${customerName}`,
          reminder_date: body.delivery_date,
          advance_days: 1,
          source: "auto_detected",
          call_id: null,
        } as never)
      );
    }
  }

  await Promise.allSettled(sideEffects);

  return NextResponse.json({ order }, { status: 201 });
}
