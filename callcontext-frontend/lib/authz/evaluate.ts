import type { FeatureKey } from "@/lib/authz/features";
import { ALL_FEATURES } from "@/lib/authz/features";
import type { ShopRole } from "@/lib/authz/roles";
import { roleAllowsFeature } from "@/lib/authz/roles";
import type { SubscriptionPlan } from "@/lib/authz/plans";
import { planAllowsFeature } from "@/lib/authz/plans";

export function canAccessFeature(
  role: ShopRole,
  plan: SubscriptionPlan,
  feature: FeatureKey
): boolean {
  return roleAllowsFeature(role, feature) && planAllowsFeature(plan, feature);
}

export function listAllowedFeatures(
  role: ShopRole,
  plan: SubscriptionPlan
): FeatureKey[] {
  return ALL_FEATURES.filter((f) => canAccessFeature(role, plan, f));
}
