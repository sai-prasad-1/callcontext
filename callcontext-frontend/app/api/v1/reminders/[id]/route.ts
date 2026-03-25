import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { withApiKeyAuth, type ApiContext } from "../../middleware";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateReminderSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  due_at: z.string().datetime().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  completed: z.boolean().optional(),
});

async function handleGet(
  request: NextRequest,
  context: ApiContext,
  params: { id: string }
) {
  const { data: reminder, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("id", params.id)
    .eq("shop_id", context.shopId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }
    console.error("GET /api/v1/reminders/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminder });
}

async function handlePatch(
  request: NextRequest,
  context: ApiContext,
  params: { id: string }
) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = updateReminderSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { data: reminder, error } = await supabase
    .from("reminders")
    .update(validation.data)
    .eq("id", params.id)
    .eq("shop_id", context.shopId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }
    console.error("PATCH /api/v1/reminders/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminder });
}

async function handleDelete(
  request: NextRequest,
  context: ApiContext,
  params: { id: string }
) {
  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", params.id)
    .eq("shop_id", context.shopId);

  if (error) {
    console.error("DELETE /api/v1/reminders/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export const GET = withApiKeyAuth(handleGet);
export const PATCH = withApiKeyAuth(handlePatch);
export const DELETE = withApiKeyAuth(handleDelete);
