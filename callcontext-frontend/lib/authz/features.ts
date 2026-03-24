/**
 * Capability keys for RBAC + plan entitlements.
 * Add new keys here as the product grows; wire them in roles.ts and plans.ts.
 */
export const Feature = {
  DASHBOARD_VIEW: "dashboard.view",
  CALLS_ACCESS: "calls.access",
  CALLS_EXPORT: "calls.export",
  CUSTOMERS_ACCESS: "customers.access",
  ORDERS_ACCESS: "orders.access",
  REMINDERS_ACCESS: "reminders.access",
  TASKS_ACCESS: "tasks.access",
  MARKETING_ACCESS: "marketing.access",
  ANALYTICS_BASIC: "analytics.basic",
  ANALYTICS_ADVANCED: "analytics.advanced",
  AUTOMATIONS_ACCESS: "automations.access",
  SETTINGS_ACCESS: "settings.access",
  SETTINGS_BILLING: "settings.billing",
  TEAM_INVITE: "team.invite",
  TEAM_MANAGE: "team.manage",
  INTEGRATIONS_MANAGE: "integrations.manage",
  WEBHOOKS_MANAGE: "webhooks.manage",
} as const;

export type FeatureKey = (typeof Feature)[keyof typeof Feature];

export const ALL_FEATURES: readonly FeatureKey[] = Object.values(Feature);
