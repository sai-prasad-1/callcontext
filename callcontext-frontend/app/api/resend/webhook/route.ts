import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyResendWebhook } from "@/lib/resend/verify-webhook";

interface ResendWebhookEvent {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.complained"
    | "email.bounced"
    | "email.opened"
    | "email.clicked";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    tags?: Array<{ name: string; value: string }>;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("svix-signature") || "";
    const body = await request.text();

    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (webhookSecret) {
      const isValid = verifyResendWebhook(body, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event: ResendWebhookEvent = JSON.parse(body);
    console.log("Received Resend webhook:", event.type);

    const campaignTag = event.data.tags?.find(
      (tag) => tag.name === "campaign_id"
    );
    if (!campaignTag) {
      console.log("No campaign_id tag found, skipping");
      return NextResponse.json({ received: true });
    }

    const campaignId = campaignTag.value;
    const supabase = await createClient();

    const { data: campaign, error: fetchError } = await supabase
      .from("campaigns")
      .select("stats")
      .eq("id", campaignId)
      .single();

    if (fetchError || !campaign) {
      console.error("Campaign not found:", campaignId);
      return NextResponse.json({ received: true });
    }

    const stats = (campaign.stats as Record<string, number>) || {};

    switch (event.type) {
      case "email.delivered":
        stats.delivered = (stats.delivered || 0) + 1;
        break;
      case "email.opened":
        stats.opened = (stats.opened || 0) + 1;
        break;
      case "email.clicked":
        stats.clicked = (stats.clicked || 0) + 1;
        break;
      case "email.bounced":
        stats.failed = (stats.failed || 0) + 1;
        break;
      case "email.complained":
        stats.complained = (stats.complained || 0) + 1;
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    const { error: updateError } = await supabase
      .from("campaigns")
      .update({ stats } as never)
      .eq("id", campaignId);

    if (updateError) {
      console.error("Failed to update campaign stats:", updateError);
      return NextResponse.json(
        { error: "Failed to update stats" },
        { status: 500 }
      );
    }

    console.log(`Updated campaign ${campaignId} with event ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
