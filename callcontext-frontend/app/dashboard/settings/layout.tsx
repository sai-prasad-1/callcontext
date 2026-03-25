import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { Feature } from "@/lib/authz/features";
import { SettingsSubnav } from "@/components/settings/SettingsSubnav";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const access = await loadDashboardAccess(user.id);
  if (!access) redirect("/onboarding");

  const showBilling = access.allowedFeatures.includes(Feature.SETTINGS_BILLING);
  const showTeam =
    access.role === "owner" ||
    access.role === "manager" ||
    access.allowedFeatures.includes(Feature.TEAM_INVITE) ||
    access.allowedFeatures.includes(Feature.TEAM_MANAGE);

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold text-warm-900 mb-2">Settings</h1>
      <p className="text-sm text-warm-600 mb-6">
        Billing, usage, and team access for {access.shop.name}.
      </p>
      <SettingsSubnav showBilling={showBilling} showTeam={showTeam} />
      {children}
    </div>
  );
}
