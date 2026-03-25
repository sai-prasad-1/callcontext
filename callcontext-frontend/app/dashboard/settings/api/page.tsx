import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { ApiSettingsClient } from "@/components/settings/ApiSettingsClient";

export default async function ApiSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await loadDashboardAccess(user.id);
  if (!access) redirect("/onboarding");

  const isOwner = access.role === "owner";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold text-warm-900 mb-2">
          API & Webhooks
        </h2>
        <p className="text-warm-600 text-sm">
          Manage API keys and webhook endpoints for integrations
        </p>
      </div>

      {!isOwner ? (
        <div className="bg-warm-50 border border-warm-200 rounded-lg p-4">
          <p className="text-warm-700 text-sm">
            Only shop owners can manage API keys and webhooks.
          </p>
        </div>
      ) : (
        <ApiSettingsClient />
      )}
    </div>
  );
}
