import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { Feature } from "@/lib/authz/features";
import { PLAN_LIMITS } from "@/lib/utils/constants";
import { parseShopBillingSettings } from "@/lib/shop/billing-settings";
import { BillingClient } from "@/components/settings/BillingClient";
import { Card, CardBody } from "@/components/ui/Card";

export default async function BillingSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await getDashboardAccess(supabase, user.id);
  if (!access) redirect("/signup");

  if (!access.allowedFeatures.includes(Feature.SETTINGS_BILLING)) {
    return (
      <Card>
        <CardBody>
          <h2 className="font-display text-lg font-semibold text-warm-900">Billing</h2>
          <p className="mt-2 text-sm text-warm-600">
            Your role does not include billing management. Ask a shop owner to upgrade the plan or
            grant access.
          </p>
        </CardBody>
      </Card>
    );
  }

  const planKey = access.plan as keyof typeof PLAN_LIMITS;
  const planLabel =
    planKey in PLAN_LIMITS ? PLAN_LIMITS[planKey].name : access.shop.subscription_plan;

  const prefs = parseShopBillingSettings(access.shop.settings);

  const canEdit = access.shop.owner_id === user.id;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-warm-900 mb-6">Billing & usage</h2>
      <BillingClient
        planLabel={planLabel}
        trialEndsAt={access.shop.trial_ends_at}
        stripeCustomerId={access.shop.stripe_customer_id}
        usageBillingEnabled={Boolean(prefs.usage_billing_enabled)}
        preferredBillingMode={prefs.preferred_billing_mode ?? null}
        canEdit={canEdit}
      />
    </div>
  );
}
