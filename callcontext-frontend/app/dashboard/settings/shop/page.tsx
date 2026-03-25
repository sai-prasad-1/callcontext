import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { ShopSettingsClient } from "@/components/settings/ShopSettingsClient";

export default async function ShopSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await loadDashboardAccess(user.id);
  if (!access) redirect("/onboarding");

  const canEdit = access.role === "owner" || access.role === "manager";

  const { data: fullShop } = await supabase
    .from("shops")
    .select("name, address, city, state, zip, timezone, custom_greeting, consent_mode")
    .eq("id", access.shop.id)
    .single();

  const shop = fullShop ?? access.shop;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-warm-900 mb-6">Shop settings</h2>
      <ShopSettingsClient
        shopName={(shop as any).name ?? ""}
        address={(shop as any).address ?? null}
        city={(shop as any).city ?? null}
        state={(shop as any).state ?? null}
        zip={(shop as any).zip ?? null}
        timezone={(shop as any).timezone ?? "America/New_York"}
        customGreeting={(shop as any).custom_greeting ?? null}
        consentMode={(shop as any).consent_mode ?? "auto"}
        canEdit={canEdit}
      />
    </div>
  );
}
