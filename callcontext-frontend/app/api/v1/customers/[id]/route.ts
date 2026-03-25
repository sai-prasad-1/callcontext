import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { withApiKeyAuth, type ApiContext } from "../../middleware";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateCustomerSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

async function handleGet(
  request: NextRequest,
  context: ApiContext,
  params: { id: string }
) {
  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .eq("shop_id", context.shopId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    console.error("GET /api/v1/customers/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customer });
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

  const validation = updateCustomerSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .update(validation.data)
    .eq("id", params.id)
    .eq("shop_id", context.shopId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    console.error("PATCH /api/v1/customers/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customer });
}

async function handleDelete(
  request: NextRequest,
  context: ApiContext,
  params: { id: string }
) {
  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", params.id)
    .eq("shop_id", context.shopId);

  if (error) {
    console.error("DELETE /api/v1/customers/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export const GET = withApiKeyAuth(handleGet);
export const PATCH = withApiKeyAuth(handlePatch);
export const DELETE = withApiKeyAuth(handleDelete);
