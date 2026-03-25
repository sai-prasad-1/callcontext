import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { NotificationsClient } from "@/components/settings/NotificationsClient";

export default async function NotificationsSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await loadDashboardAccess(user.id);
  if (!access) redirect("/onboarding");

  const settings =
    access.shop.settings && typeof access.shop.settings === "object"
      ? (access.shop.settings as Record<string, unknown>)
      : {};

  const notifPrefs =
    settings.notification_prefs && typeof settings.notification_prefs === "object"
      ? (settings.notification_prefs as Record<string, boolean>)
      : {};

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-warm-900 mb-6">Notifications</h2>
      <NotificationsClient initialPrefs={notifPrefs} />
    </div>
  );
}
