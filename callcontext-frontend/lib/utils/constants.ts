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

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" },
  { label: "Calls", href: "/calls", icon: "Phone" },
  { label: "Customers", href: "/customers", icon: "Users" },
  { label: "Orders", href: "/orders", icon: "ShoppingBag" },
  { label: "Reminders", href: "/reminders", icon: "Bell" },
  { label: "Tasks", href: "/tasks", icon: "CheckSquare" },
  { label: "Marketing", href: "/marketing", icon: "Megaphone" },
  { label: "Analytics", href: "/analytics", icon: "BarChart3" },
] as const;

export const NAV_BOTTOM = [
  { label: "Automations", href: "/automations", icon: "Zap" },
  { label: "Settings", href: "/settings", icon: "Settings" },
] as const;
