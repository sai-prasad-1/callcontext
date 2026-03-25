import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { SegmentDetailClient } from "@/components/marketing/SegmentDetailClient";
import { applySegmentFilter, type SegmentFilter } from "@/lib/utils/segment-filters";

export default async function SegmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await loadDashboardAccess(user.id);
  if (!access) {
    redirect("/onboarding");
  }

  const { id } = await params;

  const { data: segment, error } = await supabase
    .from("segments")
    .select("*")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .maybeSingle();

  if (error || !segment) {
    redirect("/dashboard/marketing");
  }

  let customersQuery = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("shop_id", access.shop.id);

  customersQuery = applySegmentFilter(
    customersQuery,
    segment.filter as SegmentFilter
  );

  const filter = segment.filter as SegmentFilter;

  if (filter.total_calls_min !== undefined) {
    const { data: callData } = await supabase
      .from("calls")
      .select("customer_id")
      .eq("shop_id", access.shop.id)
      .not("customer_id", "is", null);

    if (callData) {
      const callCounts = callData.reduce(
        (acc, row) => {
          const id = row.customer_id as string;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const customerIds = Object.entries(callCounts)
        .filter(([_, count]) => count >= filter.total_calls_min!)
        .map(([id]) => id);

      if (customerIds.length > 0) {
        customersQuery = customersQuery.in("id", customerIds);
      } else {
        return (
          <SegmentDetailClient
            segment={segment}
            initialCustomers={[]}
            initialTotal={0}
          />
        );
      }
    }
  }

  customersQuery = customersQuery
    .order("last_contact_date", { ascending: false, nullsFirst: false })
    .range(0, 19);

  const { data: customers, count } = await customersQuery;

  return (
    <SegmentDetailClient
      segment={segment}
      initialCustomers={customers ?? []}
      initialTotal={count ?? 0}
    />
  );
}
