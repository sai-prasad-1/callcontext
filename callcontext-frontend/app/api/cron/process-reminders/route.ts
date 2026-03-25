import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const expectedAuth = `Bearer ${cronSecret}`;
      if (authHeader !== expectedAuth) {
        console.error("Cron auth failed: Invalid authorization header");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      console.warn(
        "CRON_SECRET not set - allowing all requests (dev mode only)"
      );
    }

    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: reminders, error: fetchError } = await supabase
      .from("reminders")
      .select("*, customer:customers!customer_id(id, first_name, last_name)")
      .eq("status", "pending")
      .lte("reminder_date", today)
      .or(`snoozed_until.is.null,snoozed_until.lte.${today}`);

    if (fetchError) {
      console.error("Failed to fetch reminders:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch reminders" },
        { status: 500 }
      );
    }

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({
        processed: 0,
        created_recurring: 0,
        message: "No reminders to process",
      });
    }

    let processedCount = 0;
    let recurringCreatedCount = 0;

    for (const reminder of reminders) {
      try {
        // TODO: When notification system is implemented, insert notification record here
        // Example:
        // if (shop has notification system) {
        //   await supabase.from("notifications").insert({
        //     shop_id: reminder.shop_id,
        //     customer_id: reminder.customer_id,
        //     type: "reminder",
        //     title: reminder.title,
        //     body: reminder.description,
        //     link: `/dashboard/customers/${reminder.customer_id}`,
        //   });
        // }

        const { error: updateError } = await supabase
          .from("reminders")
          .update({ status: "sent" } as never)
          .eq("id", reminder.id);

        if (updateError) {
          console.error(
            `Failed to update reminder ${reminder.id}:`,
            updateError
          );
          continue;
        }

        processedCount++;

        if (reminder.recurring && reminder.recurrence_pattern) {
          const currentDate = new Date(reminder.reminder_date);
          let nextDate = new Date(currentDate);

          switch (reminder.recurrence_pattern) {
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

          const { error: recurError } = await supabase
            .from("reminders")
            .insert({
              shop_id: reminder.shop_id,
              customer_id: reminder.customer_id,
              title: reminder.title,
              description: reminder.description,
              reminder_date: nextDate.toISOString().split("T")[0],
              advance_days: reminder.advance_days,
              recurring: reminder.recurring,
              recurrence_pattern: reminder.recurrence_pattern,
              source: reminder.source,
              status: "pending",
              snoozed_until: null,
            } as never);

          if (recurError) {
            console.error(
              `Failed to create recurring reminder for ${reminder.id}:`,
              recurError
            );
          } else {
            recurringCreatedCount++;
          }
        }
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        continue;
      }
    }

    console.log(
      `Processed ${processedCount} reminders, created ${recurringCreatedCount} recurring reminders`
    );

    return NextResponse.json({
      processed: processedCount,
      created_recurring: recurringCreatedCount,
    });
  } catch (error) {
    console.error("Unexpected error in process-reminders cron:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
