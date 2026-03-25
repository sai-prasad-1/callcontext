import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { getShopConfig } from "@/lib/utils/shop-config";
import { CustomerListClient } from "@/components/customers/CustomerListClient";

export default async function CustomersPage() {
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

  const { data: customers, count } = await supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("shop_id", access.shop.id)
    .order("last_contact_date", { ascending: false, nullsFirst: false })
    .range(0, 19);

  return (
    <CustomerListClient
      shopConfig={shopConfig}
      initialCustomers={customers ?? []}
      initialTotal={count ?? 0}
    />
  );
}
