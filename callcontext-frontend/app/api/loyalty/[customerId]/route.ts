import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";

type Params = {
  customerId: string;
};

const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
};

function calculateNextTier(currentTier: string, points: number, configTiers: typeof TIER_THRESHOLDS) {
  const tiers = ["bronze", "silver", "gold", "platinum"];
  const currentIndex = tiers.indexOf(currentTier);
  
  if (currentIndex === tiers.length - 1) {
    return {
      next_tier: null,
      next_tier_threshold: null,
      progress_percent: 100,
    };
  }

  const nextTier = tiers[currentIndex + 1];
  const nextThreshold = configTiers[nextTier as keyof typeof configTiers];
  const currentThreshold = configTiers[currentTier as keyof typeof configTiers];
  const pointsInTier = points - currentThreshold;
  const pointsNeeded = nextThreshold - currentThreshold;
  const progress = Math.min(100, Math.round((pointsInTier / pointsNeeded) * 100));

  return {
    next_tier: nextTier,
    next_tier_threshold: nextThreshold,
    progress_percent: progress,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { customerId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await loadDashboardAccess(user.id);
    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, shop_id, loyalty_tier, loyalty_points")
      .eq("id", customerId)
      .eq("shop_id", access.shop.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const { data: shop } = await supabase
      .from("shops")
      .select("settings")
      .eq("id", access.shop.id)
      .single();

    const settings = shop?.settings as Record<string, unknown>;
    const loyalty = (settings?.loyalty as Record<string, unknown>) ?? {};
    const configTiers = (loyalty.tiers as typeof TIER_THRESHOLDS) ?? TIER_THRESHOLDS;
    const rewards = (loyalty.rewards as Array<{ id: string; name: string; description: string; points_required: number }>) ?? [];

    const availableRewards = rewards.filter(
      (reward) => reward.points_required <= customer.loyalty_points
    );

    const { data: transactions, error: transactionsError } = await supabase
      .from("loyalty_transactions")
      .select("*")
      .eq("shop_id", access.shop.id)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
    }

    const tierProgress = calculateNextTier(
      customer.loyalty_tier,
      customer.loyalty_points,
      configTiers
    );

    return NextResponse.json({
      tier: customer.loyalty_tier,
      points: customer.loyalty_points,
      next_tier: tierProgress.next_tier,
      next_tier_threshold: tierProgress.next_tier_threshold,
      progress_percent: tierProgress.progress_percent,
      available_rewards: availableRewards,
      transactions: transactions ?? [],
    });
  } catch (error) {
    console.error("Error fetching customer loyalty data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
