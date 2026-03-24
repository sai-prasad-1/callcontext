import type { FeatureKey } from "@/lib/authz/features";
import { Feature } from "@/lib/authz/features";

export const SubscriptionPlan = {
  TRIAL: "trial",
  STARTER: "starter",
  PRO: "pro",
  GROWTH: "growth",
} as const;

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

const PLAN_RANK: Record<SubscriptionPlan, number> = {
  trial: 0,
  starter: 1,
  pro: 2,
  growth: 3,
};

/** Minimum plan tier required for a feature (inclusive). */
export const FEATURE_MIN_PLAN: Partial<Record<FeatureKey, SubscriptionPlan>> = {
  [Feature.CALLS_EXPORT]: SubscriptionPlan.STARTER,
  [Feature.MARKETING_ACCESS]: SubscriptionPlan.STARTER,
  [Feature.AUTOMATIONS_ACCESS]: SubscriptionPlan.STARTER,
  [Feature.ANALYTICS_ADVANCED]: SubscriptionPlan.PRO,
  [Feature.INTEGRATIONS_MANAGE]: SubscriptionPlan.STARTER,
  [Feature.WEBHOOKS_MANAGE]: SubscriptionPlan.PRO,
  [Feature.TEAM_INVITE]: SubscriptionPlan.STARTER,
  [Feature.TEAM_MANAGE]: SubscriptionPlan.PRO,
};

export function planMeetsMinimum(
  plan: SubscriptionPlan,
  minimum: SubscriptionPlan
): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[minimum];
}

export function planAllowsFeature(
  plan: SubscriptionPlan,
  feature: FeatureKey
): boolean {
  const min = FEATURE_MIN_PLAN[feature];
  if (!min) return true;
  return planMeetsMinimum(plan, min);
}

export function parseSubscriptionPlan(
  value: string | null | undefined
): SubscriptionPlan {
  if (value === SubscriptionPlan.STARTER) return SubscriptionPlan.STARTER;
  if (value === SubscriptionPlan.PRO) return SubscriptionPlan.PRO;
  if (value === SubscriptionPlan.GROWTH) return SubscriptionPlan.GROWTH;
  return SubscriptionPlan.TRIAL;
}
