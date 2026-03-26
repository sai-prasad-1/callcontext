import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

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

  const fiveMinutesAgo = new Date();
  fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

  const { data: calls, error } = await supabase
    .from("calls")
    .select(`
      id,
      customer_id,
      status,
      started_at,
      direction,
      customers (
        id,
        first_name,
        last_name,
        phone
      )
    `)
    .eq("shop_id", access.shop.id)
    .in("status", ["ringing", "active"])
    .gte("started_at", fiveMinutesAgo.toISOString())
    .order("started_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("GET /api/calls/live:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formattedCalls = (calls || []).map((call: any) => {
    const customer = call.customers;
    return {
      id: call.id,
      customer_id: customer?.id || null,
      customer_name: customer
        ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || null
        : null,
      customer_phone: customer?.phone || "Unknown",
      started_at: call.started_at,
      status: call.status,
      direction: call.direction,
    };
  });

  return NextResponse.json({ calls: formattedCalls });
}
