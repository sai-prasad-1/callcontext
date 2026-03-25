import { Feature, type FeatureKey } from "@/lib/authz/features";

export const TWO_PARTY_STATES = new Set([
  "CA",
  "CT",
  "DE",
  "FL",
  "IL",
  "MD",
  "MA",
  "MT",
  "NV",
  "NH",
  "PA",
  "WA",
  "MI",
  "VT",
]);

export const PLAN_LIMITS = {
  trial: { calls: 1000, name: "Trial", price: 0 },
  starter: { calls: 300, name: "Starter", price: 4900 },
  pro: { calls: 1000, name: "Pro", price: 6900 },
  growth: { calls: -1, name: "Growth", price: 9900 },
} as const;

export const SENTIMENT_CONFIG = {
  positive: {
    label: "Positive",
    color: "text-success-700",
    bg: "bg-success-50",
  },
  neutral: { label: "Neutral", color: "text-warning-700", bg: "bg-warning-50" },
  negative: { label: "Negative", color: "text-danger-700", bg: "bg-danger-50" },
} as const;

export type NavItemDef = {
  label: string;
  href: string;
  icon: string;
  /** Required for RBAC + plan filtering in dashboard shell */
  feature: FeatureKey;
};

export const NAV_ITEMS: readonly NavItemDef[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", feature: Feature.DASHBOARD_VIEW },
  { label: "Calls", href: "/dashboard/calls", icon: "Phone", feature: Feature.CALLS_ACCESS },
  { label: "Customers", href: "/dashboard/customers", icon: "Users", feature: Feature.CUSTOMERS_ACCESS },
  { label: "Orders", href: "/dashboard/orders", icon: "ShoppingBag", feature: Feature.ORDERS_ACCESS },
  { label: "Reminders", href: "/dashboard/reminders", icon: "Bell", feature: Feature.REMINDERS_ACCESS },
  { label: "Tasks", href: "/dashboard/tasks", icon: "CheckSquare", feature: Feature.TASKS_ACCESS },
  { label: "Marketing", href: "/dashboard/marketing", icon: "Megaphone", feature: Feature.MARKETING_ACCESS },
  { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3", feature: Feature.ANALYTICS_BASIC },
  { label: "Activity", href: "/dashboard/activity", icon: "Activity", feature: Feature.ACTIVITY_FEED },
] as const;

export const NAV_BOTTOM: readonly NavItemDef[] = [
  { label: "Automations", href: "/dashboard/automations", icon: "Zap", feature: Feature.AUTOMATIONS_ACCESS },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings", feature: Feature.SETTINGS_ACCESS },
] as const;
