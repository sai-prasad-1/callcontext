import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { dispatchWebhook } from "@/lib/webhooks/dispatch";

export async function POST(
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

  const { data: endpoint, error } = await supabase
    .from("webhook_endpoints")
    .select("*")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (error || !endpoint) {
    return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
  }

  const testEvent = endpoint.events[0] || "test.event";
  const testData = {
    test: true,
    timestamp: new Date().toISOString(),
    message: "This is a test webhook delivery",
  };

  await dispatchWebhook({
    shopId: access.shop.id,
    event: testEvent,
    data: testData,
  });

  const { data: latestDelivery } = await supabase
    .from("webhook_deliveries")
    .select("id")
    .eq("webhook_endpoint_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    success: true,
    delivery_id: latestDelivery?.id,
  });
}
