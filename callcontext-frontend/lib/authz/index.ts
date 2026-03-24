export { Feature, ALL_FEATURES, type FeatureKey } from "@/lib/authz/features";
export {
  ShopRole,
  ROLE_FEATURES,
  roleAllowsFeature,
  parseShopRole,
} from "@/lib/authz/roles";
export {
  SubscriptionPlan,
  FEATURE_MIN_PLAN,
  planAllowsFeature,
  planMeetsMinimum,
  parseSubscriptionPlan,
} from "@/lib/authz/plans";
export { canAccessFeature, listAllowedFeatures } from "@/lib/authz/evaluate";
export { getDashboardAccess, type DashboardAccess, type ShopRow } from "@/lib/authz/server";
export { forbiddenUnlessFeature } from "@/lib/authz/guard";
