import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CreditCard,
  Settings2,
  Users,
  User,
  Store,
  Bell,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { Feature } from "@/lib/authz/features";
import { Card, CardBody } from "@/components/ui/Card";

export default async function SettingsOverviewPage() {
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

  const cards = [
    {
      href: "/dashboard/settings/profile",
      title: "Profile",
      description: "Your name, contact info, and account details.",
      icon: User,
      show: true,
    },
    {
      href: "/dashboard/settings/shop",
      title: "Shop",
      description: "Business name, address, timezone, greeting, and consent mode.",
      icon: Store,
      show: true,
    },
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
    {
      href: "/dashboard/settings/notifications",
      title: "Notifications",
      description: "Email and in-app notification preferences.",
      icon: Bell,
      show: true,
    },
    {
      href: "/dashboard/settings/security",
      title: "Security",
      description: "Password management and session info.",
      icon: Shield,
      show: true,
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
            <h2 className="font-display font-semibold text-warm-900">
              Settings for {access.shop.name}
            </h2>
            <p className="mt-1 text-sm text-warm-600">
              Manage your account, shop configuration, billing, team, and preferences.
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href}>
              <Card variant="hover" className="h-full">
                <CardBody className="flex gap-3">
                  <div className="shrink-0 rounded-lg bg-brand-50 p-2 text-brand-600">
                    <Icon size={20} />
                  </div>
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
    </div>
  );
}
