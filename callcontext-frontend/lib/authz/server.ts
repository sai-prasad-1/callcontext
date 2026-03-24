import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeatureKey } from "@/lib/authz/features";
import { listAllowedFeatures } from "@/lib/authz/evaluate";
import { parseShopRole, type ShopRole } from "@/lib/authz/roles";
import { parseSubscriptionPlan, type SubscriptionPlan } from "@/lib/authz/plans";

export type ShopRow = {
  id: string;
  name: string;
  subscription_plan: string;
  trial_ends_at: string | null;
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  /** JSON from `shops.settings` (billing prefs, etc.) */
  settings: unknown | null;
};

export type DashboardAccess = {
  shop: ShopRow;
  role: ShopRole;
  plan: SubscriptionPlan;
  allowedFeatures: FeatureKey[];
};

type MembershipShopJoin = {
  role: string;
  shops: ShopRow | null;
};

/**
 * Resolves the current user's primary shop + role for dashboard RBAC.
 * Prefers active membership row; falls back to legacy owner-only shops if migrations are not applied.
 */
export async function getDashboardAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<DashboardAccess | null> {
  const { data: membership, error: memError } = await supabase
    .from("shop_memberships")
    .select(
      `
      role,
      shops (
        id,
        name,
        subscription_plan,
        trial_ends_at,
        owner_id,
        stripe_customer_id,
        stripe_subscription_id,
        settings
      )
    `
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!memError && membership) {
    const row = membership as unknown as MembershipShopJoin;
    const shop = row.shops;
    const role = parseShopRole(row.role);
    if (shop && role) {
      const plan = parseSubscriptionPlan(shop.subscription_plan);
      return {
        shop,
        role,
        plan,
        allowedFeatures: listAllowedFeatures(role, plan),
      };
    }
  }

  const { data: owned } = await supabase
    .from("shops")
    .select(
      "id, name, subscription_plan, trial_ends_at, owner_id, stripe_customer_id, stripe_subscription_id, settings"
    )
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();

  if (owned) {
    const shop = owned as ShopRow;
    const plan = parseSubscriptionPlan(shop.subscription_plan);
    return {
      shop,
      role: "owner",
      plan,
      allowedFeatures: listAllowedFeatures("owner", plan),
    };
  }

  return null;
}
