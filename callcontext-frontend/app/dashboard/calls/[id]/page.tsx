import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { getShopConfig } from "@/lib/utils/shop-config";
import { CallDetailClient } from "@/components/calls/CallDetailClient";

export default async function CallDetailPage({
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

  const allRes = await Promise.all([
    supabase.from("calls").select("*, customer:customers!customer_id(id, first_name, last_name, phone, tags, loyalty_tier)").eq("id", id).eq("shop_id", access.shop.id).single(),
    supabase.from("orders").select("*").eq("call_id", id).eq("shop_id", access.shop.id).limit(1).maybeSingle(),
    supabase.from("reminders").select("*").eq("call_id", id).eq("shop_id", access.shop.id),
  ] as const);

  const callRes = allRes[0] as { data: any; error: any };
  const orderRes = allRes[1] as { data: any; error: any };
  const remindersRes = allRes[2] as { data: any[]; error: any };

  if (callRes.error || !callRes.data) notFound();

  const call = callRes.data;
  const customer = call.customer ?? null;

  return (
    <CallDetailClient
      call={call}
      customer={customer}
      linkedOrder={orderRes.data ?? null}
      linkedReminders={remindersRes.data ?? []}
      shopConfig={shopConfig}
    />
  );
}
