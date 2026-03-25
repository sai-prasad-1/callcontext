import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { resend } from "@/lib/resend/client";

interface ProcessResult {
  processed: number;
  completed: number;
  failed: number;
  errors: Array<{ action_id: string; error: string }>;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized cron request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    const result: ProcessResult = {
      processed: 0,
      completed: 0,
      failed: 0,
      errors: [],
    };

    const { data: actions, error: actionsError } = await supabase
      .from("scheduled_actions")
      .select("*")
      .eq("status", "pending")
      .lte("execute_at", new Date().toISOString())
      .limit(100);

    if (actionsError) {
      console.error("Failed to fetch scheduled actions:", actionsError);
      return NextResponse.json(
        { error: "Failed to fetch scheduled actions" },
        { status: 500 }
      );
    }

    if (!actions || actions.length === 0) {
      return NextResponse.json(result);
    }

    for (const action of actions) {
      result.processed++;

      try {
        const config = action.action_config as any;

        switch (action.action_type) {
          case "send_sms":
            if (process.env.VONAGE_API_KEY && process.env.VONAGE_API_SECRET) {
              console.log(`Would send SMS to ${config.to}: ${config.message}`);
            } else {
              console.log(`SMS sending not configured. Action: ${action.id}`);
            }
            break;

          case "send_email":
            if (config.to && config.subject && config.html) {
              await resend.emails.send({
                from: config.from || "CallContext <noreply@callcontext.ai>",
                to: config.to,
                subject: config.subject,
                html: config.html,
              });
            }
            break;

          case "create_task":
            await supabase.from("tasks").insert({
              shop_id: action.shop_id,
              customer_id: config.customer_id || null,
              title: config.title,
              description: config.description || null,
              priority: config.priority || "medium",
              status: "open",
            });
            break;

          case "create_reminder":
            await supabase.from("reminders").insert({
              shop_id: action.shop_id,
              customer_id: config.customer_id,
              title: config.title,
              description: config.description || null,
              reminder_date: config.reminder_date,
              advance_days: config.advance_days || 0,
              recurring: config.recurring || false,
              recurrence_pattern: config.recurrence_pattern || null,
              status: "pending",
              source: "auto_detected",
            });
            break;

          case "update_customer":
            if (config.customer_id) {
              await supabase
                .from("customers")
                .update(config.updates)
                .eq("id", config.customer_id)
                .eq("shop_id", action.shop_id);
            }
            break;

          default:
            throw new Error(`Unknown action type: ${action.action_type}`);
        }

        await supabase
          .from("scheduled_actions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", action.id);

        result.completed++;
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        await supabase
          .from("scheduled_actions")
          .update({
            status: "failed",
            error: errorMessage,
            completed_at: new Date().toISOString(),
          })
          .eq("id", action.id);

        result.failed++;
        result.errors.push({
          action_id: action.id,
          error: errorMessage,
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Process automations cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
