import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { TaskBoardClient } from "@/components/tasks/TaskBoardClient";

export default async function TasksPage() {
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

  const [tasksResult, customersResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("*, customer:customers!customer_id(id, first_name, last_name, phone)")
      .eq("shop_id", access.shop.id)
      .order("priority", { ascending: false })
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase
      .from("customers")
      .select("id, first_name, last_name, phone")
      .eq("shop_id", access.shop.id)
      .order("first_name", { ascending: true }),
  ]);

  return (
    <TaskBoardClient
      initialTasks={tasksResult.data ?? []}
      userId={user.id}
      customers={customersResult.data ?? []}
    />
  );
}
