import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const createReminderSchema = z.object({
  customer_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  reminder_date: z.string(),
  advance_days: z.number().int().min(0).default(7),
  recurring: z.boolean().optional(),
  recurrence_pattern: z.enum(["yearly", "monthly", "weekly"]).optional(),
});

const querySchema = z.object({
  status: z.string().default("pending"),
  customer_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
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
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const { status, customer_id, date_from, date_to, page, limit } = parsed.data;

  let query = supabase
    .from("reminders")
    .select(
      "*, customer:customers!customer_id(id, first_name, last_name, phone)",
      { count: "exact" }
    )
    .eq("shop_id", access.shop.id);

  if (status) {
    query = query.eq("status", status);
  }

  if (customer_id) {
    query = query.eq("customer_id", customer_id);
  }

  if (date_from) {
    query = query.gte("reminder_date", date_from);
  }

  if (date_to) {
    query = query.lte("reminder_date", date_to);
  }

  query = query.order("reminder_date", { ascending: true });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: reminders, count, error } = await query;

  if (error) {
    console.error("GET /api/reminders:", error);
    return NextResponse.json(
      { error: "Failed to load reminders" },
      { status: 500 }
    );
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    reminders: reminders ?? [],
    total,
    page,
    totalPages,
  });
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

  let body: z.infer<typeof createReminderSchema>;
  try {
    body = createReminderSchema.parse(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("id", body.customer_id)
    .eq("shop_id", access.shop.id)
    .maybeSingle();

  if (!customer) {
    return NextResponse.json(
      { error: "Customer not found in shop" },
      { status: 404 }
    );
  }

  const { data: reminder, error } = await supabase
    .from("reminders")
    .insert({
      shop_id: access.shop.id,
      customer_id: body.customer_id,
      title: body.title,
      description: body.description ?? null,
      reminder_date: body.reminder_date,
      advance_days: body.advance_days,
      recurring: body.recurring ?? false,
      recurrence_pattern: body.recurrence_pattern ?? null,
      source: "manual",
      status: "pending",
    } as never)
    .select()
    .single();

  if (error) {
    console.error("POST /api/reminders:", error);
    return NextResponse.json(
      { error: "Failed to create reminder" },
      { status: 500 }
    );
  }

  return NextResponse.json({ reminder }, { status: 201 });
}
