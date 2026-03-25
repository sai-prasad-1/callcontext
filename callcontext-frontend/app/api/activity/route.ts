import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

type Activity = {
  id: string;
  type: "call" | "note" | "order" | "reminder";
  timestamp: string;
  data: Record<string, unknown>;
  customer_id?: string;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const scope = searchParams.get("scope") ?? "customer";
  const customerId = searchParams.get("customer_id");
  const eventType = searchParams.get("event_type") ?? "all";

  if (scope === "customer" && !customerId) {
    return NextResponse.json(
      { error: "customer_id is required for customer scope" },
      { status: 400 }
    );
  }

  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

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

  const shopId = access.shop.id;

  const queries = [];

  if (eventType === "all" || eventType === "call") {
    const callQuery = supabase
      .from("calls")
      .select(
        scope === "shop"
          ? "id, started_at, duration_seconds, ai_summary, direction, status, sentiment, customer_id, customer:customers!customer_id(id, first_name, last_name)"
          : "id, started_at, duration_seconds, ai_summary, direction, status, sentiment"
      )
      .eq("shop_id", shopId);

    if (scope === "customer") {
      callQuery.eq("customer_id", customerId!);
    }

    queries.push(callQuery);
  }

  if (eventType === "all" || eventType === "note") {
    const noteQuery = supabase
      .from("notes")
      .select(
        scope === "shop"
          ? "id, created_at, content, pinned, customer_id, customer:customers!customer_id(id, first_name, last_name)"
          : "id, created_at, content, pinned"
      )
      .eq("shop_id", shopId);

    if (scope === "customer") {
      noteQuery.eq("customer_id", customerId!);
    }

    queries.push(noteQuery);
  }

  if (eventType === "all" || eventType === "order") {
    const orderQuery = supabase
      .from("orders")
      .select(
        scope === "shop"
          ? "id, created_at, products, total_amount, status, customer_id, customer:customers!customer_id(id, first_name, last_name)"
          : "id, created_at, products, total_amount, status"
      )
      .eq("shop_id", shopId);

    if (scope === "customer") {
      orderQuery.eq("customer_id", customerId!);
    }

    queries.push(orderQuery);
  }

  if (eventType === "all" || eventType === "reminder") {
    const reminderQuery = supabase
      .from("reminders")
      .select(
        scope === "shop"
          ? "id, created_at, title, source, reminder_date, customer_id, customer:customers!customer_id(id, first_name, last_name)"
          : "id, created_at, title, source, reminder_date"
      )
      .eq("shop_id", shopId);

    if (scope === "customer") {
      reminderQuery.eq("customer_id", customerId!);
    }

    queries.push(reminderQuery);
  }

  const results = await Promise.all(queries);

  if (results.some((r) => r.error)) {
    const msg = results.find((r) => r.error)?.error?.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const activities: Activity[] = [];
  let queryIndex = 0;

  if (eventType === "all" || eventType === "call") {
    const callsResult = results[queryIndex++];
    activities.push(
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
      }))
    );
  }

  if (eventType === "all" || eventType === "note") {
    const notesResult = results[queryIndex++];
    activities.push(
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
      }))
    );
  }

  if (eventType === "all" || eventType === "order") {
    const ordersResult = results[queryIndex++];
    activities.push(
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
      }))
    );
  }

  if (eventType === "all" || eventType === "reminder") {
    const remindersResult = results[queryIndex++];
    activities.push(
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
      }))
    );
  }

  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const total = activities.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginated = activities.slice(start, start + limit);

  return NextResponse.json({
    activities: paginated,
    total,
    page,
    totalPages,
  });
}
