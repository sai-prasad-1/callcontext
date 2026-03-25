import { INDUSTRY_TEMPLATES } from "@/lib/constants/industry-templates";
import type { IndustryType, ShopIndustryConfig } from "@/lib/types/shop-config";

export function getShopConfig(
  shopSettings: Record<string, unknown> | null | undefined
): ShopIndustryConfig {
  const s = (shopSettings ?? {}) as Record<string, unknown>;
  const industry = (s.industry as IndustryType) || "general";
  const template =
    INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES.general;

  return {
    ...template,
    ...(s as Partial<ShopIndustryConfig>),
    industry,
    product_vocabulary: {
      ...template.product_vocabulary,
      ...((s.product_vocabulary as Record<string, unknown>) ?? {}),
    } as ShopIndustryConfig["product_vocabulary"],
    preference_labels: {
      ...template.preference_labels,
      ...((s.preference_labels as Record<string, unknown>) ?? {}),
    } as ShopIndustryConfig["preference_labels"],
    service_labels: {
      ...template.service_labels,
      ...((s.service_labels as Record<string, unknown>) ?? {}),
    } as ShopIndustryConfig["service_labels"],
  };
}
