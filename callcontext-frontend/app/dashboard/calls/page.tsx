import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { CallListClient } from "@/components/calls/CallListClient";

export default async function CallsPage() {
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

  const { data: calls, count } = await supabase
    .from("calls")
    .select(
      "*, customer:customers!customer_id(id, first_name, last_name, phone)",
      { count: "exact" }
    )
    .eq("shop_id", access.shop.id)
    .order("started_at", { ascending: false })
    .range(0, 19);

  return (
    <CallListClient
      initialCalls={calls ?? []}
      initialTotal={count ?? 0}
    />
  );
}
