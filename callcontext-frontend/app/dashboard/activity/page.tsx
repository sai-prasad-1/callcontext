import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { getShopConfig } from "@/lib/utils/shop-config";
import { ActivityFeed } from "@/components/activity/ActivityFeed";

export default async function ActivityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await loadDashboardAccess(user.id);
  if (!access) {
    redirect("/onboarding");
  }

  const shopConfig = getShopConfig(
    access.shop.settings as Record<string, unknown> | null
  );

  const shopId = access.shop.id;
  const limit = 20;

  const [callsResult, notesResult, ordersResult, remindersResult] =
    await Promise.all([
      supabase
        .from("calls")
        .select(
          "id, started_at, duration_seconds, ai_summary, direction, status, sentiment, customer_id, customer:customers!customer_id(id, first_name, last_name)"
        )
        .eq("shop_id", shopId)
        .order("started_at", { ascending: false })
        .limit(limit),
      supabase
        .from("notes")
        .select(
          "id, created_at, content, pinned, customer_id, customer:customers!customer_id(id, first_name, last_name)"
        )
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("orders")
        .select(
          "id, created_at, products, total_amount, status, customer_id, customer:customers!customer_id(id, first_name, last_name)"
        )
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("reminders")
        .select(
          "id, created_at, title, source, reminder_date, customer_id, customer:customers!customer_id(id, first_name, last_name)"
        )
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

  const activities: any[] = [
    ...(callsResult.data ?? []).map((c: any) => ({
      id: c.id,
      type: "call" as const,
      timestamp: c.started_at,
      customer_id: c.customer_id,
      customer: c.customer,
      data: {
        duration_seconds: c.duration_seconds,
        ai_summary: c.ai_summary,
        direction: c.direction,
        status: c.status,
        sentiment: c.sentiment,
      },
    })),
    ...(notesResult.data ?? []).map((n: any) => ({
      id: n.id,
      type: "note" as const,
      timestamp: n.created_at,
      customer_id: n.customer_id,
      customer: n.customer,
      data: {
        content: n.content,
        pinned: n.pinned,
      },
    })),
    ...(ordersResult.data ?? []).map((o: any) => ({
      id: o.id,
      type: "order" as const,
      timestamp: o.created_at,
      customer_id: o.customer_id,
      customer: o.customer,
      data: {
        products: o.products,
        total_amount: o.total_amount,
        status: o.status,
      },
    })),
    ...(remindersResult.data ?? []).map((r: any) => ({
      id: r.id,
      type: "reminder" as const,
      timestamp: r.created_at,
      customer_id: r.customer_id,
      customer: r.customer,
      data: {
        title: r.title,
        source: r.source,
        reminder_date: r.reminder_date,
      },
    })),
  ];

  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const initialActivities = activities.slice(0, limit);
  const total = activities.length;

  return (
    <ActivityFeed
      initialActivities={initialActivities}
      initialTotal={total}
      scope="shop"
      shopConfig={shopConfig}
    />
  );
}
