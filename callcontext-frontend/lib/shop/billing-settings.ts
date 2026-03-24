export type BillingMode = "subscription" | "usage" | "hybrid";

export type ShopBillingPreferences = {
  usage_billing_enabled?: boolean;
  preferred_billing_mode?: BillingMode;
};

export function parseShopBillingSettings(raw: unknown): ShopBillingPreferences {
  if (!raw || typeof raw !== "object") return {};
  const s = raw as Record<string, unknown>;
  const mode = s.preferred_billing_mode;
  const validMode =
    mode === "subscription" || mode === "usage" || mode === "hybrid" ? mode : undefined;
  return {
    usage_billing_enabled:
      typeof s.usage_billing_enabled === "boolean" ? s.usage_billing_enabled : undefined,
    preferred_billing_mode: validMode,
  };
}

export function mergeShopSettings(
  current: Record<string, unknown> | null | undefined,
  patch: ShopBillingPreferences
): Record<string, unknown> {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...current }
      : {};
  if (patch.usage_billing_enabled !== undefined) {
    base.usage_billing_enabled = patch.usage_billing_enabled;
  }
  if (patch.preferred_billing_mode !== undefined) {
    base.preferred_billing_mode = patch.preferred_billing_mode;
  }
  return base;
}
