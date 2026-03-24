import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, Settings2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { Feature } from "@/lib/authz/features";
import { Card, CardBody } from "@/components/ui/Card";

export default async function SettingsOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const access = await getDashboardAccess(supabase, user.id);
  if (!access) redirect("/signup");

  const showBilling = access.allowedFeatures.includes(Feature.SETTINGS_BILLING);
  const showTeam =
    access.role === "owner" ||
    access.role === "manager" ||
    access.allowedFeatures.includes(Feature.TEAM_INVITE) ||
    access.allowedFeatures.includes(Feature.TEAM_MANAGE);

  const cards = [
    {
      href: "/dashboard/settings/billing",
      title: "Billing & usage",
      description: "Plans, pay-per-minute metering, and payment methods.",
      icon: CreditCard,
      show: showBilling,
    },
    {
      href: "/dashboard/settings/team",
      title: "Team",
      description: "Invite staff and manage roles.",
      icon: Users,
      show: showTeam,
    },
  ].filter((c) => c.show);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex gap-4 items-start">
          <div className="rounded-lg bg-brand-50 p-3 text-brand-600">
            <Settings2 size={22} />
          </div>
          <div>
            <h2 className="font-display font-semibold text-warm-900">Shop preferences</h2>
            <p className="mt-1 text-sm text-warm-600">
              More options (telephony, consent, notifications) will live here as we ship Week 2+.
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href}>
              <Card variant="hover" className="h-full">
                <CardBody className="flex gap-3">
                  <Icon className="shrink-0 text-brand-600" size={20} />
                  <div>
                    <h3 className="font-medium text-warm-900">{c.title}</h3>
                    <p className="mt-1 text-sm text-warm-500">{c.description}</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>

      {cards.length === 0 && (
        <p className="text-sm text-warm-500">
          No additional settings sections are available for your role. Contact an owner if you need
          billing or team access.
        </p>
      )}
    </div>
  );
}
