import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { RemindersListClient } from "@/components/reminders/RemindersListClient";

export default async function RemindersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const access = await loadDashboardAccess(user.id);
  if (!access) {
    redirect("/onboarding");
  }

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const { data: reminders } = await supabase
    .from("reminders")
    .select("*, customer:customers!customer_id(id, first_name, last_name, phone)")
    .eq("shop_id", access.shop.id)
    .lte("reminder_date", thirtyDaysFromNow.toISOString())
    .order("reminder_date", { ascending: true });

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);

  const initialData = {
    overdue: (reminders || []).filter((r: any) => new Date(r.reminder_date) < todayStart),
    today: (reminders || []).filter((r: any) => {
      const d = new Date(r.reminder_date);
      return d >= todayStart && d <= todayEnd;
    }),
    this_week: (reminders || []).filter((r: any) => {
      const d = new Date(r.reminder_date);
      return d > todayEnd && d <= weekEnd;
    }),
    upcoming: (reminders || []).filter((r: any) => {
      const d = new Date(r.reminder_date);
      return d > weekEnd;
    }),
  };

  return (
    <RemindersListClient initialData={initialData} userId={user.id} />
  );
}
