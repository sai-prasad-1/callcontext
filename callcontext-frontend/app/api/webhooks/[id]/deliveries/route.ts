import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  const { data: endpoint } = await supabase
    .from("webhook_endpoints")
    .select("shop_id")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: deliveries, count, error } = await supabase
    .from("webhook_deliveries")
    .select("*", { count: "exact" })
    .eq("webhook_endpoint_id", id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("GET /api/webhooks/[id]/deliveries:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    deliveries: deliveries ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
