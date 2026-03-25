import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { AUTOMATION_RULES } from "@/lib/constants/automation-rules";

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

  const shopSettings = (access.shop.settings as any) || {};
  const automationSettings = shopSettings.automations || {};

  const rulesWithStats = await Promise.all(
    AUTOMATION_RULES.map(async (rule) => {
      const ruleSettings = automationSettings[rule.id] || {};
      const enabled = ruleSettings.enabled ?? rule.default_enabled;
      const template = ruleSettings.template ?? rule.template;

      const { count: pending } = await supabase
        .from("scheduled_actions")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", access.shop.id)
        .eq("rule_id", rule.id)
        .eq("status", "pending");

      const { count: completed } = await supabase
        .from("scheduled_actions")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", access.shop.id)
        .eq("rule_id", rule.id)
        .eq("status", "completed");

      const { count: failed } = await supabase
        .from("scheduled_actions")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", access.shop.id)
        .eq("rule_id", rule.id)
        .eq("status", "failed");

      return {
        ...rule,
        enabled,
        template,
        stats: {
          pending: pending ?? 0,
          completed: completed ?? 0,
          failed: failed ?? 0,
        },
      };
    })
  );

  return NextResponse.json({ rules: rulesWithStats });
}
