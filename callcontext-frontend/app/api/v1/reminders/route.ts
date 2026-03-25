import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { withApiKeyAuth, type ApiContext } from "../middleware";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const createReminderSchema = z.object({
  customer_id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_at: z.string().datetime(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

async function handleGet(request: NextRequest, context: ApiContext) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") ?? 20)));
  const completed = params.get("completed");
  const customerId = params.get("customer_id")?.trim() || null;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("reminders")
    .select("*", { count: "exact" })
    .eq("shop_id", context.shopId);

  if (completed !== null) {
    query = query.eq("completed", completed === "true");
  }

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }

  query = query
    .order("due_at", { ascending: true })
    .range(from, to);

  const { data: reminders, count, error } = await query;

  if (error) {
    console.error("GET /api/v1/reminders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    reminders: reminders ?? [],
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

  const validation = createReminderSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const reminderData = {
    ...validation.data,
    shop_id: context.shopId,
  };

  const { data: reminder, error } = await supabase
    .from("reminders")
    .insert(reminderData)
    .select()
    .single();

  if (error) {
    console.error("POST /api/v1/reminders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminder }, { status: 201 });
}

export const GET = withApiKeyAuth(handleGet);
export const POST = withApiKeyAuth(handlePost);
