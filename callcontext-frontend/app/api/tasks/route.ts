import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  customer_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["open", "in_progress", "done"]).default("open"),
  assigned_to: z.string().uuid().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getDashboardAccess(supabase, user.id);
  if (!access) {
    return NextResponse.json({ error: "No shop" }, { status: 404 });
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*, customer:customers!customer_id(id, first_name, last_name, phone)")
    .eq("shop_id", access.shop.id)
    .order("priority", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("GET /api/tasks:", error);
    return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
  }

  return NextResponse.json({ tasks: tasks ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getDashboardAccess(supabase, user.id);
  if (!access) {
    return NextResponse.json({ error: "No shop" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid task data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const taskData = {
    ...parsed.data,
    shop_id: access.shop.id,
    assigned_to: parsed.data.assigned_to || user.id,
  };

  const { data: task, error } = await supabase
    .from("tasks")
    .insert(taskData)
    .select("*, customer:customers!customer_id(id, first_name, last_name, phone)")
    .single();

  if (error) {
    console.error("POST /api/tasks:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }

  return NextResponse.json({ task }, { status: 201 });
}
