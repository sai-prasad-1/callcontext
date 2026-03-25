import { createServiceClient } from "@/lib/supabase/service";

interface TriggerAutomationParams {
  shop_id: string;
  rule_id: string;
  delay_hours: number;
  action_type: string;
  action_config: any;
}

export async function triggerAutomation(params: TriggerAutomationParams) {
  const { shop_id, rule_id, delay_hours, action_type, action_config } = params;

  const supabase = createServiceClient();

  const executeAt = new Date();
  executeAt.setHours(executeAt.getHours() + delay_hours);

  const { data, error } = await supabase
    .from("scheduled_actions")
    .insert({
      shop_id,
      rule_id,
      action_type,
      action_config,
      execute_at: executeAt.toISOString(),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create scheduled action:", error);
    throw error;
  }

  return data;
}

export function renderTemplate(template: string, data: Record<string, any>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, String(value ?? ""));
  }
  
  return result;
}

interface CustomerCreatedParams {
  shop_id: string;
  customer_id: string;
  customer_phone: string;
  customer_first_name: string | null;
  shop_name: string;
  rule_config: {
    enabled: boolean;
    template: string;
  };
}

export async function triggerWelcomeSMS(params: CustomerCreatedParams) {
  const { shop_id, customer_id, customer_phone, customer_first_name, shop_name, rule_config } = params;

  if (!rule_config.enabled) {
    return null;
  }

  const message = renderTemplate(rule_config.template, {
    first_name: customer_first_name || "there",
    shop_name,
  });

  return triggerAutomation({
    shop_id,
    rule_id: "welcome_sms",
    delay_hours: 1,
    action_type: "send_sms",
    action_config: {
      to: customer_phone,
      message,
      customer_id,
    },
  });
}

interface OrderDeliveredParams {
  shop_id: string;
  order_id: string;
  customer_id: string;
  customer_phone: string;
  customer_first_name: string | null;
  shop_name: string;
  rule_config: {
    enabled: boolean;
    template: string;
  };
}

export async function triggerPostDeliveryFollowup(params: OrderDeliveredParams) {
  const { shop_id, order_id, customer_id, customer_phone, customer_first_name, shop_name, rule_config } = params;

  if (!rule_config.enabled) {
    return null;
  }

  const message = renderTemplate(rule_config.template, {
    first_name: customer_first_name || "there",
    shop_name,
  });

  return triggerAutomation({
    shop_id,
    rule_id: "post_delivery_followup",
    delay_hours: 48,
    action_type: "send_sms",
    action_config: {
      to: customer_phone,
      message,
      customer_id,
      order_id,
    },
  });
}

interface CallFollowupParams {
  shop_id: string;
  call_id: string;
  customer_id: string | null;
  customer_name: string;
  call_summary: string | null;
  rule_config: {
    enabled: boolean;
    template: string;
  };
}

export async function triggerFollowupTask(params: CallFollowupParams) {
  const { shop_id, call_id, customer_id, customer_name, call_summary, rule_config } = params;

  if (!rule_config.enabled) {
    return null;
  }

  const title = renderTemplate(rule_config.template, {
    customer_name,
    call_summary: call_summary || "recent call",
  });

  return triggerAutomation({
    shop_id,
    rule_id: "followup_task",
    delay_hours: 0,
    action_type: "create_task",
    action_config: {
      customer_id,
      title,
      description: `Follow-up needed for call ${call_id}`,
      priority: "high",
    },
  });
}

interface CallPositiveSentimentParams {
  shop_id: string;
  call_id: string;
  customer_id: string | null;
  customer_phone: string | null;
  customer_first_name: string | null;
  shop_name: string;
  review_link: string;
  rule_config: {
    enabled: boolean;
    template: string;
  };
}

export async function triggerReviewRequest(params: CallPositiveSentimentParams) {
  const { shop_id, call_id, customer_id, customer_phone, customer_first_name, shop_name, review_link, rule_config } = params;

  if (!rule_config.enabled || !customer_phone) {
    return null;
  }

  const message = renderTemplate(rule_config.template, {
    first_name: customer_first_name || "there",
    review_link,
  });

  return triggerAutomation({
    shop_id,
    rule_id: "review_request",
    delay_hours: 168,
    action_type: "send_sms",
    action_config: {
      to: customer_phone,
      message,
      customer_id,
      call_id,
    },
  });
}
