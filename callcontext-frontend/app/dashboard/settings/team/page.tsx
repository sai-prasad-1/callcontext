import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { canAccessFeature } from "@/lib/authz/evaluate";
import { Feature } from "@/lib/authz/features";
import { TeamClient } from "@/components/settings/TeamClient";

export default async function TeamSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await loadDashboardAccess(user.id);
  if (!access) redirect("/onboarding");

  const showTeam =
    access.role === "owner" ||
    access.role === "manager" ||
    access.allowedFeatures.includes(Feature.TEAM_INVITE) ||
    access.allowedFeatures.includes(Feature.TEAM_MANAGE);

  if (!showTeam) {
    redirect("/dashboard/settings");
  }

  const canInvite =
    (access.role === "owner" || access.role === "manager") &&
    canAccessFeature(access.role, access.plan, Feature.TEAM_INVITE);

  const inviteHint = !canInvite
    ? access.role === "owner" || access.role === "manager"
      ? "Invites require a Starter plan or higher. Upgrade billing to add teammates."
      : undefined
    : undefined;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-warm-900 mb-6">Team</h2>
      <TeamClient canInvite={canInvite} inviteHint={inviteHint} />
    </div>
  );
}
