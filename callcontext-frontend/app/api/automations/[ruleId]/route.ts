import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { AUTOMATION_RULES } from "@/lib/constants/automation-rules";

const updateRuleSchema = z.object({
  enabled: z.boolean().optional(),
  template: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { ruleId: string } }
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

  const { ruleId } = params;
  const rule = AUTOMATION_RULES.find((r) => r.id === ruleId);
  if (!rule) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }

  let body: z.infer<typeof updateRuleSchema>;
  try {
    body = updateRuleSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const shopSettings = (access.shop.settings as any) || {};
  const automationSettings = shopSettings.automations || {};
  const ruleSettings = automationSettings[ruleId] || {};

  const updatedRuleSettings = {
    ...ruleSettings,
    ...(body.enabled !== undefined && { enabled: body.enabled }),
    ...(body.template !== undefined && { template: body.template }),
  };

  const updatedAutomationSettings = {
    ...automationSettings,
    [ruleId]: updatedRuleSettings,
  };

  const { error } = await supabase
    .from("shops")
    .update({
      settings: {
        ...shopSettings,
        automations: updatedAutomationSettings,
      },
    })
    .eq("id", access.shop.id);

  if (error) {
    console.error("PATCH /api/automations/[ruleId]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    rule: {
      ...rule,
      enabled: updatedRuleSettings.enabled ?? rule.default_enabled,
      template: updatedRuleSettings.template ?? rule.template,
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ruleId: string } }
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

  const { ruleId } = params;
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: actions, count, error } = await supabase
    .from("scheduled_actions")
    .select("*", { count: "exact" })
    .eq("shop_id", access.shop.id)
    .eq("rule_id", ruleId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("GET /api/automations/[ruleId]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    actions: actions ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
