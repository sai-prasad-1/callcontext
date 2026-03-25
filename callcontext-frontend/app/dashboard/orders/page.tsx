import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { getShopConfig } from "@/lib/utils/shop-config";
import { OrderListClient } from "@/components/orders/OrderListClient";

export default async function OrdersPage() {
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

  const shopConfig = getShopConfig(access.shop.settings);

  const { data: orders, count } = await supabase
    .from("orders")
    .select(
      "*, customer:customers!customer_id(id, first_name, last_name, phone)",
      { count: "exact" }
    )
    .eq("shop_id", access.shop.id)
    .order("created_at", { ascending: false })
    .range(0, 19);

  return (
    <OrderListClient
      initialOrders={orders ?? []}
      initialTotal={count ?? 0}
      shopConfig={shopConfig}
    />
  );
}
