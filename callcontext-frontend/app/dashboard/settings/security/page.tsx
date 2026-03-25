import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { SecurityClient } from "@/components/settings/SecurityClient";

export default async function SecuritySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await loadDashboardAccess(user.id);
  if (!access) redirect("/onboarding");

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-warm-900 mb-6">Security</h2>
      <SecurityClient />
    </div>
  );
}
