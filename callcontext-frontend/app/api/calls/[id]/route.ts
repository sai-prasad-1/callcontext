import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { triggerFollowupTask, triggerReviewRequest } from "@/lib/automations/triggers";

const updateCallSchema = z.object({
  follow_up_needed: z.boolean().optional(),
  sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  tags: z.array(z.string()).optional(),
  ai_summary: z.string().optional(),
  transcript: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const [callResult, orderResult, remindersResult] = await Promise.all([
    supabase
      .from("calls")
      .select(
        "*, customer:customers!customer_id(id, first_name, last_name, phone, tags, loyalty_tier)"
      )
      .eq("id", id)
      .eq("shop_id", access.shop.id)
      .maybeSingle(),
    supabase.from("orders").select("*").eq("call_id", id).limit(1).maybeSingle(),
    supabase.from("reminders").select("*").eq("call_id", id),
  ]);

  if (callResult.error) {
    console.error("GET /api/calls/[id]:", callResult.error);
    return NextResponse.json({ error: "Failed to load call" }, { status: 500 });
  }

  if (!callResult.data) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  const callData = callResult.data as Record<string, unknown>;

  return NextResponse.json({
    call: callData,
    customer: callData.customer ?? null,
    linked: {
      order: orderResult.data ?? null,
      reminders: remindersResult.data ?? [],
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  let body: z.infer<typeof updateCallSchema>;
  try {
    body = updateCallSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: existingCall, error: fetchError } = await supabase
    .from("calls")
    .select("*, customer:customers!customer_id(id, first_name, last_name, phone)")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (fetchError || !existingCall) {
    return NextResponse.json({ error: "Call not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.follow_up_needed !== undefined) updateData.follow_up_needed = body.follow_up_needed;
  if (body.sentiment !== undefined) updateData.sentiment = body.sentiment;
  if (body.tags !== undefined) updateData.tags = body.tags;
  if (body.ai_summary !== undefined) updateData.ai_summary = body.ai_summary;
  if (body.transcript !== undefined) updateData.transcript = body.transcript;

  const { data: call, error } = await supabase
    .from("calls")
    .update(updateData as never)
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .select()
    .single();

  if (error) {
    console.error("PATCH /api/calls/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shopSettings = (access.shop.settings as any) || {};
  const automationSettings = shopSettings.automations || {};

  if (body.follow_up_needed && !existingCall.follow_up_needed) {
    const followupRule = automationSettings.followup_task || { enabled: true };
    const customer = existingCall.customer as any;

    try {
      await triggerFollowupTask({
        shop_id: access.shop.id,
        call_id: id,
        customer_id: existingCall.customer_id,
        customer_name: customer ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim() : "Unknown",
        call_summary: existingCall.ai_summary,
        rule_config: {
          enabled: followupRule.enabled ?? true,
          template: followupRule.template ?? "Follow up with {{customer_name}} regarding {{call_summary}}",
        },
      });
    } catch (err) {
      console.error("Failed to trigger follow-up task:", err);
    }
  }

  if (body.sentiment === "positive" && existingCall.sentiment !== "positive") {
    const reviewRule = automationSettings.review_request || { enabled: false };
    const customer = existingCall.customer as any;

    if (customer?.phone) {
      try {
        await triggerReviewRequest({
          shop_id: access.shop.id,
          call_id: id,
          customer_id: existingCall.customer_id,
          customer_phone: customer.phone,
          customer_first_name: customer.first_name,
          shop_name: access.shop.name,
          review_link: "https://example.com/review",
          rule_config: {
            enabled: reviewRule.enabled ?? false,
            template: reviewRule.template ?? "Hi {{first_name}}, thanks for your recent call! Would you mind leaving us a quick review? {{review_link}}",
          },
        });
      } catch (err) {
        console.error("Failed to trigger review request:", err);
      }
    }
  }

  return NextResponse.json({ call });
}
