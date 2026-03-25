export type IndustryType =
  | "florist"
  | "bakery"
  | "salon"
  | "auto_shop"
  | "vet_clinic"
  | "restaurant"
  | "general";

export interface ShopIndustryConfig {
  industry: IndustryType;
  product_vocabulary: {
    categories: string[];
    items: string[];
  };
  occasion_vocabulary: string[];
  preference_labels: {
    primary: string;
    secondary: string;
    restrictions: string;
  };
  service_labels: {
    order: string;
    delivery: string;
    item: string;
  };
}
