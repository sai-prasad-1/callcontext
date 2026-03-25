import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeatureKey } from "@/lib/authz/features";
import { listAllowedFeatures } from "@/lib/authz/evaluate";
import { parseShopRole, type ShopRole } from "@/lib/authz/roles";
import { parseSubscriptionPlan, type SubscriptionPlan } from "@/lib/authz/plans";
import type { Json } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

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
  vonage_number: string | null;
  custom_greeting: string | null;
  business_hours: Json | null;
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
  const [memResult, ownedResult] = await Promise.all([
    supabase
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
        settings,
        vonage_number,
        custom_greeting,
        business_hours
      )
    `
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("shops")
      .select(
        "id, name, subscription_plan, trial_ends_at, owner_id, stripe_customer_id, stripe_subscription_id, settings, vonage_number, custom_greeting, business_hours"
      )
      .eq("owner_id", userId)
      .limit(1)
      .maybeSingle(),
  ]);

  const { data: membership, error: memError } = memResult;
  const { data: owned } = ownedResult;

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

/** Per-request dedupe: layout + pages share one membership/shop round-trip. */
export const loadDashboardAccess = cache(async (userId: string) => {
  const supabase = await createClient();
  return getDashboardAccess(supabase, userId);
});
