import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { CampaignWizard } from "@/components/marketing/CampaignWizard";

export default async function NewCampaignPage() {
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

  const segments = [
    {
      id: "all",
      name: "All Customers",
      filter: {},
      customer_count: 0,
    },
    {
      id: "vip",
      name: "VIP Customers",
      filter: { tags: ["VIP"] },
      customer_count: 0,
    },
    {
      id: "gold",
      name: "Gold Tier",
      filter: { loyalty_tier: "gold" },
      customer_count: 0,
    },
    {
      id: "platinum",
      name: "Platinum Tier",
      filter: { loyalty_tier: "platinum" },
      customer_count: 0,
    },
    {
      id: "high-value",
      name: "High Value Customers",
      filter: { min_lifetime_value: 500 },
      customer_count: 0,
    },
  ];

  const { count: allCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", access.shop.id);

  const { count: vipCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", access.shop.id)
    .contains("tags", ["VIP"]);

  const { count: goldCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", access.shop.id)
    .eq("loyalty_tier", "gold");

  const { count: platinumCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", access.shop.id)
    .eq("loyalty_tier", "platinum");

  const { count: highValueCount } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", access.shop.id)
    .gte("lifetime_value", 500);

  segments[0].customer_count = allCount ?? 0;
  segments[1].customer_count = vipCount ?? 0;
  segments[2].customer_count = goldCount ?? 0;
  segments[3].customer_count = platinumCount ?? 0;
  segments[4].customer_count = highValueCount ?? 0;

  return <CampaignWizard segments={segments} shopName={access.shop.name} />;
}
