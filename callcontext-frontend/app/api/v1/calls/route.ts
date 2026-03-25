import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { withApiKeyAuth, type ApiContext } from "../middleware";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handleGet(request: NextRequest, context: ApiContext) {
  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") ?? 20)));
  const status = params.get("status")?.trim() || null;
  const customerId = params.get("customer_id")?.trim() || null;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("calls")
    .select("*", { count: "exact" })
    .eq("shop_id", context.shopId);

  if (status) {
    query = query.eq("status", status);
  }

  if (customerId) {
    query = query.eq("customer_id", customerId);
  }

  query = query
    .order("started_at", { ascending: false })
    .range(from, to);

  const { data: calls, count, error } = await query;

  if (error) {
    console.error("GET /api/v1/calls:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    calls: calls ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export const GET = withApiKeyAuth(handleGet);
