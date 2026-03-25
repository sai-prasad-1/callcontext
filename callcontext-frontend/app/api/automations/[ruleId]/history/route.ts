import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { ruleId: string } }
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

  const { ruleId } = params;
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: actions, count, error } = await supabase
    .from("scheduled_actions")
    .select("*", { count: "exact" })
    .eq("shop_id", access.shop.id)
    .eq("rule_id", ruleId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("GET /api/automations/[ruleId]/history:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    actions: actions ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
