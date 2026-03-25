import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await loadDashboardAccess(user.id);
  if (!access) {
    return NextResponse.json({ error: "No shop access" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get("days") || "30");

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const { data: calls } = await supabase
    .from("calls")
    .select("sentiment")
    .eq("shop_id", access.shop.id)
    .gte("started_at", startDate.toISOString())
    .not("sentiment", "is", null);

  let positive = 0;
  let neutral = 0;
  let negative = 0;

  (calls || []).forEach((call) => {
    const sentiment = call.sentiment?.toLowerCase();
    if (sentiment === "positive") positive++;
    else if (sentiment === "neutral") neutral++;
    else if (sentiment === "negative") negative++;
  });

  return NextResponse.json({ positive, neutral, negative });
}
