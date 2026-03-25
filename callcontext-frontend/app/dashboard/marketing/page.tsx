import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { SegmentList } from "@/components/marketing/SegmentList";
import { countSegmentCustomers, type SegmentFilter } from "@/lib/utils/segment-filters";

export default async function MarketingPage() {
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

  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .eq("shop_id", access.shop.id)
    .order("is_preset", { ascending: false })
    .order("created_at", { ascending: false });

  const segmentsWithCounts = await Promise.all(
    (segments ?? []).map(async (segment) => {
      const count = await countSegmentCustomers(
        supabase,
        access.shop.id,
        segment.filter as SegmentFilter
      );
      return { ...segment, customer_count: count };
    })
  );

  return <SegmentList initialSegments={segmentsWithCounts} />;
}
