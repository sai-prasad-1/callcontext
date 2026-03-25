import Link from "next/link";
import {
  Phone,
  Users,
  ShoppingBag,
  TrendingUp,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeDate } from "@/lib/utils/formatting";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const access = await loadDashboardAccess(user.id);
  if (!access) return null;

  const shop = access.shop;

  const stats = [
    {
      label: "Total Calls",
      value: "0",
      change: "+0%",
      icon: Phone,
      color: "text-brand-500",
    },
    {
      label: "Customers",
      value: "0",
      change: "+0%",
      icon: Users,
      color: "text-accent-500",
    },
    {
      label: "Orders",
      value: "0",
      change: "+0%",
      icon: ShoppingBag,
      color: "text-success-500",
    },
    {
      label: "Revenue",
      value: "$0",
      change: "+0%",
      icon: TrendingUp,
      color: "text-info-500",
    },
  ];

  const setupItems = [
    {
      id: "phone",
      label: "Connect phone number",
      completed: !!shop?.vonage_number,
      href: "/dashboard/settings/shop",
    },
    {
      id: "greeting",
      label: "Customize greeting",
      completed: !!shop?.custom_greeting,
      href: "/dashboard/settings/shop",
    },
    {
      id: "hours",
      label: "Set business hours",
      completed: !!shop?.business_hours,
      href: "/dashboard/settings/shop",
    },
    {
      id: "profile",
      label: "Complete your profile",
      completed: !!(user.user_metadata?.first_name),
      href: "/dashboard/settings/profile",
    },
    {
      id: "team",
      label: "Invite team members",
      completed: false,
      href: "/dashboard/settings/team",
    },
  ];

  const completedCount = setupItems.filter((item) => item.completed).length;
  const progress = (completedCount / setupItems.length) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-800">
          Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}!
        </h1>
        <p className="text-warm-500 mt-1">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {completedCount < setupItems.length && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-warm-800">Get Started</h2>
                <p className="text-sm text-warm-500 mt-1">
                  {completedCount} of {setupItems.length} completed
                </p>
              </div>
              <Badge variant="info">{Math.round(progress)}%</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="mb-4 h-2 bg-warm-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-3">
              {setupItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-warm-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle2 size={20} className="text-success-500 flex-shrink-0" />
                    ) : (
                      <Circle size={20} className="text-warm-300 flex-shrink-0" />
                    )}
                    <span
                      className={
                        item.completed ? "text-warm-500 line-through" : "text-warm-700"
                      }
                    >
                      {item.label}
                    </span>
                  </div>
                  {!item.completed && (
                    <Button variant="ghost" size="sm">
                      Setup
                    </Button>
                  )}
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} variant="stat">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-warm-500">{stat.label}</p>
                  <p className="text-2xl font-semibold text-warm-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-success-600 mt-1">
                    {stat.change} from last week
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full bg-warm-50 flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon size={24} />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-800">Recent Calls</h2>
          </CardHeader>
          <CardBody>
            <EmptyState
              icon={Phone}
              title="No calls yet"
              description="Calls will appear here once you connect your phone number"
              action={
                <Link href="/settings/phone">
                  <Button variant="primary" size="sm">
                    Connect Phone
                  </Button>
                </Link>
              }
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-warm-800">Upcoming Reminders</h2>
          </CardHeader>
          <CardBody>
            <EmptyState
              icon={Clock}
              title="No reminders"
              description="Create reminders for important customer events"
              action={
                <Link href="/reminders">
                  <Button variant="primary" size="sm">
                    Create Reminder
                  </Button>
                </Link>
              }
            />
          </CardBody>
        </Card>
      </div>

      {shop?.subscription_plan === "trial" && (
        <Card className="border-accent-200 bg-accent-50">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-warm-800">You&apos;re on a free trial</h3>
                <p className="text-sm text-warm-600 mt-1">
                  {shop.trial_ends_at
                    ? `Trial ends ${formatRelativeDate(shop.trial_ends_at)}`
                    : "14 days remaining"}
                </p>
              </div>
              <Link href="/dashboard/settings/billing">
                <Button variant="accent">Upgrade Now</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
