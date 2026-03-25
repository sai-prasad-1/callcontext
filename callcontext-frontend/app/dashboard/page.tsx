import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { getShopConfig } from "@/lib/utils/shop-config";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";
import { ReminderDashboardWidget } from "@/components/reminders/ReminderDashboardWidget";
import { RecentCallsWidget } from "@/components/dashboard/RecentCallsWidget";
import { PendingOrdersWidget } from "@/components/dashboard/PendingOrdersWidget";
import { OpenTasksWidget } from "@/components/dashboard/OpenTasksWidget";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const access = await loadDashboardAccess(user.id);
  if (!access) return null;

  const shop = access.shop;
  const shopConfig = getShopConfig(shop.settings);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekStartStr = weekStart.toISOString();

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);
  const lastWeekStartStr = lastWeekStart.toISOString();

  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);
  const threeDaysFromNowStr = threeDaysFromNow.toISOString().split("T")[0];

  const [
    callsTodayResult,
    newCustomersTodayResult,
    missedCallsTodayResult,
    followUpsPendingResult,
    callsThisWeekResult,
    callsLastWeekResult,
    todayRemindersResult,
    recentCallsResult,
    pendingOrdersResult,
    openTasksResult,
    hasCustomerResult,
  ] = await Promise.all([
    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id)
      .gte("started_at", todayStr),

    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id)
      .gte("created_at", todayStr),

    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id)
      .eq("status", "missed")
      .gte("started_at", todayStr),

    supabase
      .from("calls")
      .select(
        `
        id,
        tasks!left(id, status)
      `,
        { count: "exact", head: false }
      )
      .eq("shop_id", shop.id)
      .eq("follow_up_needed", true)
      .then((result) => {
        if (!result.data) return { count: 0 };
        const callsWithoutDoneTasks = result.data.filter((call: any) => {
          if (!call.tasks || call.tasks.length === 0) return true;
          return !call.tasks.some((task: any) => task.status === "done");
        });
        return { count: callsWithoutDoneTasks.length };
      }),

    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id)
      .gte("started_at", weekStartStr),

    supabase
      .from("calls")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id)
      .gte("started_at", lastWeekStartStr)
      .lt("started_at", weekStartStr),

    supabase
      .from("reminders")
      .select(
        `
        *,
        customer:customers(id, first_name, last_name, phone)
      `
      )
      .eq("shop_id", shop.id)
      .eq("status", "pending")
      .eq("reminder_date", today.toISOString().split("T")[0])
      .order("reminder_date", { ascending: true })
      .limit(5),

    supabase
      .from("calls")
      .select(
        `
        *,
        customer:customers(id, first_name, last_name, phone)
      `
      )
      .eq("shop_id", shop.id)
      .order("started_at", { ascending: false })
      .limit(5),

    supabase
      .from("orders")
      .select(
        `
        *,
        customer:customers(id, first_name, last_name, phone)
      `
      )
      .eq("shop_id", shop.id)
      .in("status", ["pending", "confirmed"])
      .gte("delivery_date", todayStr)
      .order("delivery_date", { ascending: true })
      .limit(5),

    supabase
      .from("tasks")
      .select(
        `
        *,
        customer:customers(id, first_name, last_name)
      `
      )
      .eq("shop_id", shop.id)
      .in("status", ["open", "in_progress"])
      .or(`due_date.lte.${threeDaysFromNowStr},due_date.is.null`)
      .order("priority", { ascending: false })
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(5),

    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("shop_id", shop.id)
      .limit(1),
  ]);

  const stats = {
    calls_today: callsTodayResult.count ?? 0,
    new_customers_today: newCustomersTodayResult.count ?? 0,
    missed_calls_today: missedCallsTodayResult.count ?? 0,
    follow_ups_pending:
      typeof followUpsPendingResult.count === "number"
        ? followUpsPendingResult.count
        : 0,
    calls_this_week: callsThisWeekResult.count ?? 0,
    calls_last_week: callsLastWeekResult.count ?? 0,
  };

  const setup = {
    hasVonageNumber: !!shop.vonage_number,
    hasGreeting: !!shop.custom_greeting,
    hasBusinessHours: !!shop.business_hours && Object.keys(shop.business_hours).length > 0,
    hasCustomer: (hasCustomerResult.count ?? 0) > 0,
    hasSubscription: !!shop.stripe_subscription_id,
  };

  const userName =
    user.user_metadata?.first_name ||
    user.user_metadata?.last_name
      ? `${user.user_metadata.first_name ?? ""} ${user.user_metadata.last_name ?? ""}`.trim()
      : user.email?.split("@")[0] || "there";

  const todayReminders = todayRemindersResult.data ?? [];
  const recentCalls = recentCallsResult.data ?? [];
  const pendingOrders = pendingOrdersResult.data ?? [];
  const openTasks = openTasksResult.data ?? [];

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardGreeting userName={userName} />

      <OverviewStats stats={stats} />

      <SetupChecklist setup={setup} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ReminderDashboardWidget reminders={todayReminders} />
        <RecentCallsWidget calls={recentCalls} shopConfig={shopConfig} />
        <PendingOrdersWidget orders={pendingOrders} shopConfig={shopConfig} />
        <OpenTasksWidget tasks={openTasks} />
      </div>
    </div>
  );
}
