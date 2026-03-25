import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { LoyaltySettingsClient } from "@/components/settings/LoyaltySettingsClient";

export default async function LoyaltySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const access = await loadDashboardAccess(user.id);
  if (!access) redirect("/onboarding");

  if (access.role !== "owner") {
    redirect("/dashboard/settings");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("settings")
    .eq("id", access.shop.id)
    .single();

  const settings = shop?.settings as Record<string, unknown>;
  const loyalty = (settings?.loyalty as Record<string, unknown>) ?? {};

  const defaultSettings = {
    enabled: false,
    points_per_dollar: 1,
    tiers: {
      bronze: 0,
      silver: 500,
      gold: 1500,
      platinum: 3000,
    },
    rewards: [],
  };

  const initialSettings = {
    enabled: loyalty.enabled ?? defaultSettings.enabled,
    points_per_dollar:
      loyalty.points_per_dollar ?? defaultSettings.points_per_dollar,
    tiers: loyalty.tiers ?? defaultSettings.tiers,
    rewards: loyalty.rewards ?? defaultSettings.rewards,
  };

  return <LoyaltySettingsClient initialSettings={initialSettings as never} />;
}
