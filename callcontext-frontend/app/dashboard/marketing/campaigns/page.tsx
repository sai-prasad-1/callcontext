import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { CampaignListClient } from "@/components/marketing/CampaignListClient";

export default async function CampaignsPage() {
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

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("shop_id", access.shop.id)
    .order("created_at", { ascending: false });

  return <CampaignListClient campaigns={campaigns ?? []} />;
}
