import type { SupabaseClient } from "@supabase/supabase-js";

export type SegmentFilter = {
  loyalty_tier?: string[];
  last_contact_days?: number;
  last_contact_days_min?: number;
  lifetime_value_min?: number;
  lifetime_value_max?: number;
  created_days?: number;
  total_calls_min?: number;
  tags?: string[];
};

export function applySegmentFilter(
  query: ReturnType<SupabaseClient["from"]>,
  filter: SegmentFilter
) {
  let modifiedQuery = query;

  if (filter.loyalty_tier && filter.loyalty_tier.length > 0) {
    modifiedQuery = modifiedQuery.in("loyalty_tier", filter.loyalty_tier);
  }

  if (filter.last_contact_days !== undefined) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filter.last_contact_days);
    modifiedQuery = modifiedQuery.gte(
      "last_contact_date",
      cutoffDate.toISOString()
    );
  }

  if (filter.last_contact_days_min !== undefined) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filter.last_contact_days_min);
    modifiedQuery = modifiedQuery.lte(
      "last_contact_date",
      cutoffDate.toISOString()
    );
  }

  if (filter.lifetime_value_min !== undefined) {
    modifiedQuery = modifiedQuery.gte(
      "lifetime_value",
      filter.lifetime_value_min
    );
  }

  if (filter.lifetime_value_max !== undefined) {
    modifiedQuery = modifiedQuery.lte(
      "lifetime_value",
      filter.lifetime_value_max
    );
  }

  if (filter.created_days !== undefined) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filter.created_days);
    modifiedQuery = modifiedQuery.gte("created_at", cutoffDate.toISOString());
  }

  if (filter.tags && filter.tags.length > 0) {
    modifiedQuery = modifiedQuery.contains("tags", filter.tags);
  }

  return modifiedQuery;
}

export async function countSegmentCustomers(
  supabase: SupabaseClient,
  shopId: string,
  filter: SegmentFilter
): Promise<number> {
  let query = supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shopId);

  query = applySegmentFilter(query, filter);

  if (filter.total_calls_min !== undefined) {
    const { data: customerIds } = await supabase
      .from("calls")
      .select("customer_id")
      .eq("shop_id", shopId)
      .not("customer_id", "is", null);

    if (customerIds) {
      const callCounts = customerIds.reduce(
        (acc, row) => {
          const id = row.customer_id as string;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const qualifyingIds = Object.entries(callCounts)
        .filter(([_, count]) => count >= filter.total_calls_min!)
        .map(([id]) => id);

      if (qualifyingIds.length === 0) {
        return 0;
      }

      query = query.in("id", qualifyingIds);
    } else {
      return 0;
    }
  }

  const { count } = await query;
  return count ?? 0;
}
