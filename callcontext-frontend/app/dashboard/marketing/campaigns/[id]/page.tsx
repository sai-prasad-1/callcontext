import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { CampaignDetailClient } from "@/components/marketing/CampaignDetailClient";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (error || !campaign) {
    redirect("/dashboard/marketing/campaigns");
  }

  let segmentName = "All Customers";
  let customerCount = 0;

  if (campaign.segment_filter) {
    const filter = campaign.segment_filter as Record<string, unknown>;

    if (filter.tags && Array.isArray(filter.tags) && filter.tags.includes("VIP")) {
      segmentName = "VIP Customers";
    } else if (filter.loyalty_tier === "gold") {
      segmentName = "Gold Tier";
    } else if (filter.loyalty_tier === "platinum") {
      segmentName = "Platinum Tier";
    } else if (filter.min_lifetime_value === 500) {
      segmentName = "High Value Customers";
    }

    let query = supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", access.shop.id);

    if (filter.loyalty_tier) {
      query = query.eq("loyalty_tier", filter.loyalty_tier);
    }
    if (filter.tags && Array.isArray(filter.tags)) {
      query = query.contains("tags", filter.tags);
    }
    if (filter.min_lifetime_value) {
      query = query.gte("lifetime_value", filter.min_lifetime_value);
    }

    const { count } = await query;
    customerCount = count ?? 0;
  } else {
    const { count } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("shop_id", access.shop.id);
    customerCount = count ?? 0;
  }

  return (
    <CampaignDetailClient
      campaign={campaign}
      segmentName={segmentName}
      customerCount={customerCount}
      shopName={access.shop.name}
    />
  );
}
