import type { FeatureKey } from "@/lib/authz/features";
import { Feature, ALL_FEATURES } from "@/lib/authz/features";

export const ShopRole = {
  OWNER: "owner",
  MANAGER: "manager",
  STAFF: "staff",
  ANALYST: "analyst",
} as const;

export type ShopRole = (typeof ShopRole)[keyof typeof ShopRole];

const ALL = new Set<FeatureKey>(ALL_FEATURES);

/** Features each role may use (plan checks are applied separately). */
export const ROLE_FEATURES: Record<ShopRole, ReadonlySet<FeatureKey>> = {
  owner: ALL,
  manager: new Set(
    ALL_FEATURES.filter(
      (f) =>
        f !== Feature.SETTINGS_BILLING &&
        f !== Feature.TEAM_MANAGE
    )
  ),
  staff: new Set([
    Feature.DASHBOARD_VIEW,
    Feature.CALLS_ACCESS,
    Feature.CUSTOMERS_ACCESS,
    Feature.ORDERS_ACCESS,
    Feature.REMINDERS_ACCESS,
    Feature.TASKS_ACCESS,
    Feature.SETTINGS_ACCESS,
  ]),
  analyst: new Set([
    Feature.DASHBOARD_VIEW,
    Feature.CALLS_ACCESS,
    Feature.CUSTOMERS_ACCESS,
    Feature.ORDERS_ACCESS,
    Feature.ANALYTICS_BASIC,
    Feature.ANALYTICS_ADVANCED,
    Feature.SETTINGS_ACCESS,
  ]),
};

export function roleAllowsFeature(role: ShopRole, feature: FeatureKey): boolean {
  return ROLE_FEATURES[role]?.has(feature) ?? false;
}

export function parseShopRole(value: string | null | undefined): ShopRole | null {
  if (!value) return null;
  if (value === ShopRole.OWNER) return ShopRole.OWNER;
  if (value === ShopRole.MANAGER) return ShopRole.MANAGER;
  if (value === ShopRole.STAFF) return ShopRole.STAFF;
  if (value === ShopRole.ANALYST) return ShopRole.ANALYST;
  return null;
}
