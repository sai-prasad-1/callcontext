import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

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

  const results = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).eq("shop_id", access.shop.id).single(),
    supabase.from("calls").select("*").eq("customer_id", id).order("started_at", { ascending: false }).limit(10),
    supabase.from("orders").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("notes").select("*").eq("customer_id", id).order("pinned", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("reminders").select("*").eq("customer_id", id).eq("status", "pending"),
    supabase.from("calls").select("*", { count: "exact", head: true }).eq("customer_id", id),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("customer_id", id),
  ] as const);

  const customerResult = results[0] as { data: any; error: any };
  const callsResult = results[1] as { data: any[]; error: any };
  const ordersResult = results[2] as { data: any[]; error: any };
  const notesResult = results[3] as { data: any[]; error: any };
  const remindersResult = results[4] as { data: any[]; error: any };
  const callCountResult = results[5] as { data: any; error: any; count: number | null };
  const orderCountResult = results[6] as { data: any; error: any; count: number | null };

  if (customerResult.error || !customerResult.data) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const customer = customerResult.data;

  let daysSinceLastContact: number | null = null;
  if (customer.last_contact_date) {
    const last = new Date(customer.last_contact_date as string).getTime();
    daysSinceLastContact = Math.floor(
      (Date.now() - last) / (1000 * 60 * 60 * 24)
    );
  }

  return NextResponse.json({
    customer,
    recent_calls: callsResult.data ?? [],
    orders: ordersResult.data ?? [],
    notes: notesResult.data ?? [],
    reminders: remindersResult.data ?? [],
    stats: {
      total_calls: callCountResult.count ?? 0,
      total_orders: orderCountResult.count ?? 0,
      lifetime_value: customer.lifetime_value ?? 0,
      days_since_last_contact: daysSinceLastContact,
    },
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.preferences) {
    const { data: existing } = await supabase
      .from("customers")
      .select("preferences")
      .eq("id", id)
      .eq("shop_id", access.shop.id)
      .single();

    if ((existing as any)?.preferences) {
      const prev = (existing as any).preferences as Record<string, unknown>;
      const incoming = body.preferences as Record<string, unknown>;

      const dedupe = (arr: unknown[]) => [...new Set(arr)];

      body.preferences = {
        ...prev,
        ...incoming,
        primary: dedupe([
          ...((prev.primary as unknown[]) ?? []),
          ...((incoming.primary as unknown[]) ?? []),
        ]),
        secondary: dedupe([
          ...((prev.secondary as unknown[]) ?? []),
          ...((incoming.secondary as unknown[]) ?? []),
        ]),
        restrictions: dedupe([
          ...((prev.restrictions as unknown[]) ?? []),
          ...((incoming.restrictions as unknown[]) ?? []),
        ]),
      };
    }
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .update(body as never)
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .select()
    .single();

  if (error) {
    console.error("PATCH /api/customers/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customer });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

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

  if (access.role !== "owner" && access.role !== "manager") {
    return NextResponse.json(
      { error: "Only owners and managers can delete customers." },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("shop_id", access.shop.id);

  if (error) {
    console.error("DELETE /api/customers/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
