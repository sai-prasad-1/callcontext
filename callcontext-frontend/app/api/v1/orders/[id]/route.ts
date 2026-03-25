import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { withApiKeyAuth, type ApiContext } from "../../middleware";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateOrderSchema = z.object({
  status: z
    .enum(["pending", "confirmed", "shipped", "delivered", "cancelled"])
    .optional(),
  notes: z.string().optional(),
  tracking_number: z.string().optional(),
});

async function handleGet(
  request: NextRequest,
  context: ApiContext,
  params: { id: string }
) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .eq("shop_id", context.shopId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    console.error("GET /api/v1/orders/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order });
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

  const validation = updateOrderSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { data: order, error } = await supabase
    .from("orders")
    .update(validation.data)
    .eq("id", params.id)
    .eq("shop_id", context.shopId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    console.error("PATCH /api/v1/orders/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order });
}

export const GET = withApiKeyAuth(handleGet);
export const PATCH = withApiKeyAuth(handlePatch);
