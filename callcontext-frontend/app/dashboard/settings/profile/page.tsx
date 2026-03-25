import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { ProfileClient } from "@/components/settings/ProfileClient";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await loadDashboardAccess(user.id);
  if (!access) redirect("/onboarding");

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-warm-900 mb-6">Profile</h2>
      <ProfileClient initialEmail={user.email || ""} />
    </div>
  );
}
