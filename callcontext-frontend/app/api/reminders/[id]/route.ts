import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const updateReminderSchema = z.union([
  z.object({
    action: z.enum(["dismiss", "snooze", "complete"]),
    snooze_days: z.number().int().min(1).optional(),
  }),
  z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    reminder_date: z.string().optional(),
    advance_days: z.number().int().min(0).optional(),
    recurring: z.boolean().optional(),
    recurrence_pattern: z.enum(["yearly", "monthly", "weekly"]).optional(),
  }),
]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  const { data: reminder, error } = await supabase
    .from("reminders")
    .select(
      "*, customer:customers!customer_id(id, first_name, last_name, phone)"
    )
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .maybeSingle();

  if (error) {
    console.error("GET /api/reminders/[id]:", error);
    return NextResponse.json(
      { error: "Failed to load reminder" },
      { status: 500 }
    );
  }

  if (!reminder) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  return NextResponse.json({ reminder });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  const { data: existing } = await supabase
    .from("reminders")
    .select("*")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
  }

  let body: z.infer<typeof updateReminderSchema>;
  try {
    body = updateReminderSchema.parse(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if ("action" in body) {
    const { action, snooze_days } = body;

    if (action === "dismiss") {
      const { data: reminder, error } = await supabase
        .from("reminders")
        .update({ status: "dismissed" } as never)
        .eq("id", id)
        .eq("shop_id", access.shop.id)
        .select()
        .single();

      if (error) {
        console.error("PATCH /api/reminders/[id] (dismiss):", error);
        return NextResponse.json(
          { error: "Failed to dismiss reminder" },
          { status: 500 }
        );
      }

      return NextResponse.json({ reminder });
    }

    if (action === "snooze") {
      if (!snooze_days) {
        return NextResponse.json(
          { error: "snooze_days is required for snooze action" },
          { status: 400 }
        );
      }

      const today = new Date();
      const snoozedUntil = new Date(today);
      snoozedUntil.setDate(snoozedUntil.getDate() + snooze_days);

      const { data: reminder, error } = await supabase
        .from("reminders")
        .update({
          status: "snoozed",
          snoozed_until: snoozedUntil.toISOString(),
        } as never)
        .eq("id", id)
        .eq("shop_id", access.shop.id)
        .select()
        .single();

      if (error) {
        console.error("PATCH /api/reminders/[id] (snooze):", error);
        return NextResponse.json(
          { error: "Failed to snooze reminder" },
          { status: 500 }
        );
      }

      return NextResponse.json({ reminder });
    }

    if (action === "complete") {
      const { data: reminder, error } = await supabase
        .from("reminders")
        .update({ status: "sent" } as never)
        .eq("id", id)
        .eq("shop_id", access.shop.id)
        .select()
        .single();

      if (error) {
        console.error("PATCH /api/reminders/[id] (complete):", error);
        return NextResponse.json(
          { error: "Failed to complete reminder" },
          { status: 500 }
        );
      }

      if (existing.recurring && existing.recurrence_pattern) {
        const currentDate = new Date(existing.reminder_date);
        let nextDate = new Date(currentDate);

        switch (existing.recurrence_pattern) {
          case "yearly":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        }

        const { error: recurError } = await supabase.from("reminders").insert({
          shop_id: existing.shop_id,
          customer_id: existing.customer_id,
          title: existing.title,
          description: existing.description,
          reminder_date: nextDate.toISOString(),
          advance_days: existing.advance_days,
          recurring: existing.recurring,
          recurrence_pattern: existing.recurrence_pattern,
          source: existing.source,
          status: "pending",
        } as never);

        if (recurError) {
          console.error(
            "PATCH /api/reminders/[id] (create recurring):",
            recurError
          );
        }
      }

      return NextResponse.json({ reminder });
    }
  } else {
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.reminder_date !== undefined)
      updateData.reminder_date = body.reminder_date;
    if (body.advance_days !== undefined)
      updateData.advance_days = body.advance_days;
    if (body.recurring !== undefined) updateData.recurring = body.recurring;
    if (body.recurrence_pattern !== undefined)
      updateData.recurrence_pattern = body.recurrence_pattern;

    const { data: reminder, error } = await supabase
      .from("reminders")
      .update(updateData as never)
      .eq("id", id)
      .eq("shop_id", access.shop.id)
      .select()
      .single();

    if (error) {
      console.error("PATCH /api/reminders/[id] (update):", error);
      return NextResponse.json(
        { error: "Failed to update reminder" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reminder });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", id)
    .eq("shop_id", access.shop.id);

  if (error) {
    console.error("DELETE /api/reminders/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
