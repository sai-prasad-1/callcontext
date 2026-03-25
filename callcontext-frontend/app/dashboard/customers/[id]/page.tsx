import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { getShopConfig } from "@/lib/utils/shop-config";
import { CustomerProfileClient } from "@/components/customers/CustomerProfileClient";

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const access = await loadDashboardAccess(user.id);
  if (!access) redirect("/onboarding");

  const shopConfig = getShopConfig(
    access.shop.settings as Record<string, unknown> | null
  );

  const results = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).eq("shop_id", access.shop.id).single(),
    supabase.from("calls").select("*").eq("customer_id", id).order("started_at", { ascending: false }).limit(10),
    supabase.from("orders").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("notes").select("*").eq("customer_id", id).order("pinned", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("reminders").select("*").eq("customer_id", id).eq("status", "pending").order("reminder_date", { ascending: true }),
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
    notFound();
  }

  const customer = customerResult.data;

  let daysSinceLastContact: number | null = null;
  if (customer.last_contact_date) {
    const last = new Date(customer.last_contact_date as string).getTime();
    daysSinceLastContact = Math.floor(
      (Date.now() - last) / (1000 * 60 * 60 * 24)
    );
  }

  return (
    <CustomerProfileClient
      customer={customer}
      recentCalls={callsResult.data ?? []}
      orders={ordersResult.data ?? []}
      notes={notesResult.data ?? []}
      reminders={remindersResult.data ?? []}
      stats={{
        total_calls: callCountResult.count ?? 0,
        total_orders: orderCountResult.count ?? 0,
        lifetime_value: customer.lifetime_value ?? 0,
        days_since_last_contact: daysSinceLastContact,
      }}
      shopConfig={shopConfig}
      shopSettings={access.shop.settings as Record<string, unknown>}
      userId={user.id}
    />
  );
}
