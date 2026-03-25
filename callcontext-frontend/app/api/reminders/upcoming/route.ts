import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
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

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters" },
      { status: 400 }
    );
  }

  const { days } = parsed.data;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const weekAfter = new Date(today);
  weekAfter.setDate(weekAfter.getDate() + 8);
  const weekAfterStr = weekAfter.toISOString().split("T")[0];

  const upcomingEnd = new Date(today);
  upcomingEnd.setDate(upcomingEnd.getDate() + days);
  const upcomingEndStr = upcomingEnd.toISOString().split("T")[0];

  const [overdueResult, todayResult, thisWeekResult, upcomingResult] =
    await Promise.all([
      supabase
        .from("reminders")
        .select(
          "*, customer:customers!customer_id(id, first_name, last_name, phone)"
        )
        .eq("shop_id", access.shop.id)
        .lt("reminder_date", todayStr)
        .in("status", ["pending", "sent"])
        .order("reminder_date", { ascending: true }),

      supabase
        .from("reminders")
        .select(
          "*, customer:customers!customer_id(id, first_name, last_name, phone)"
        )
        .eq("shop_id", access.shop.id)
        .eq("reminder_date", todayStr)
        .eq("status", "pending")
        .order("reminder_date", { ascending: true }),

      supabase
        .from("reminders")
        .select(
          "*, customer:customers!customer_id(id, first_name, last_name, phone)"
        )
        .eq("shop_id", access.shop.id)
        .gte("reminder_date", tomorrowStr)
        .lte("reminder_date", weekEndStr)
        .eq("status", "pending")
        .order("reminder_date", { ascending: true }),

      supabase
        .from("reminders")
        .select(
          "*, customer:customers!customer_id(id, first_name, last_name, phone)"
        )
        .eq("shop_id", access.shop.id)
        .gte("reminder_date", weekAfterStr)
        .lte("reminder_date", upcomingEndStr)
        .eq("status", "pending")
        .order("reminder_date", { ascending: true }),
    ]);

  if (overdueResult.error) {
    console.error("GET /api/reminders/upcoming (overdue):", overdueResult.error);
    return NextResponse.json(
      { error: "Failed to load overdue reminders" },
      { status: 500 }
    );
  }

  if (todayResult.error) {
    console.error("GET /api/reminders/upcoming (today):", todayResult.error);
    return NextResponse.json(
      { error: "Failed to load today's reminders" },
      { status: 500 }
    );
  }

  if (thisWeekResult.error) {
    console.error(
      "GET /api/reminders/upcoming (this_week):",
      thisWeekResult.error
    );
    return NextResponse.json(
      { error: "Failed to load this week's reminders" },
      { status: 500 }
    );
  }

  if (upcomingResult.error) {
    console.error(
      "GET /api/reminders/upcoming (upcoming):",
      upcomingResult.error
    );
    return NextResponse.json(
      { error: "Failed to load upcoming reminders" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    overdue: overdueResult.data ?? [],
    today: todayResult.data ?? [],
    this_week: thisWeekResult.data ?? [],
    upcoming: upcomingResult.data ?? [],
  });
}
