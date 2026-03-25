export type AutomationTrigger =
  | "customer_created"
  | "order_delivered"
  | "customer_birthday"
  | "customer_inactive_90d"
  | "call_positive_sentiment"
  | "call_followup_needed";

export type AutomationActionType =
  | "send_sms"
  | "send_email"
  | "create_task"
  | "create_reminder"
  | "update_customer";

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  delay_hours: number;
  action_type: AutomationActionType;
  default_enabled: boolean;
  template: string;
}

export const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "welcome_sms",
    name: "Welcome SMS",
    description: "Send a welcome message to new customers 1 hour after they join",
    trigger: "customer_created",
    delay_hours: 1,
    action_type: "send_sms",
    default_enabled: true,
    template:
      "Hi {{first_name}}! Thanks for contacting {{shop_name}}. We're excited to serve you!",
  },
  {
    id: "post_delivery_followup",
    name: "Post-Delivery Follow-up",
    description: "Check in with customers 2 days after order delivery",
    trigger: "order_delivered",
    delay_hours: 48,
    action_type: "send_sms",
    default_enabled: true,
    template:
      "Hi {{first_name}}, how was your recent order from {{shop_name}}? We'd love to hear your feedback!",
  },
  {
    id: "birthday_outreach",
    name: "Birthday Outreach",
    description: "Send birthday wishes on customer's birthday",
    trigger: "customer_birthday",
    delay_hours: 0,
    action_type: "send_sms",
    default_enabled: false,
    template:
      "🎂 Happy Birthday {{first_name}}! Enjoy 15% off your next order at {{shop_name}}. Use code: BDAY15",
  },
  {
    id: "win_back_inactive",
    name: "Win Back Inactive",
    description: "Re-engage customers who haven't contacted in 90 days",
    trigger: "customer_inactive_90d",
    delay_hours: 0,
    action_type: "send_sms",
    default_enabled: false,
    template:
      "We miss you, {{first_name}}! Come back to {{shop_name}} and enjoy a special 20% off. We'd love to see you again!",
  },
  {
    id: "review_request",
    name: "Review Request",
    description: "Request review 7 days after positive call",
    trigger: "call_positive_sentiment",
    delay_hours: 168,
    action_type: "send_sms",
    default_enabled: false,
    template:
      "Hi {{first_name}}, thanks for your recent call! Would you mind leaving us a quick review? {{review_link}}",
  },
  {
    id: "followup_task",
    name: "Follow-up Task",
    description: "Create task for staff when call marked follow-up needed",
    trigger: "call_followup_needed",
    delay_hours: 0,
    action_type: "create_task",
    default_enabled: true,
    template: "Follow up with {{customer_name}} regarding {{call_summary}}",
  },
];
