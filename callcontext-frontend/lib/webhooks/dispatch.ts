import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import crypto from "crypto";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DispatchWebhookParams {
  shopId: string;
  event: string;
  data: any;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
}

async function sendWebhookWithRetry(
  endpoint: WebhookEndpoint,
  payload: any,
  signature: string,
  event: string,
  maxRetries: number = 3
): Promise<{ success: boolean; status?: number; body?: string }> {
  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": event,
        },
        body: JSON.stringify(payload),
      });

      const responseBody = await response.text();

      if (response.ok) {
        return {
          success: true,
          status: response.status,
          body: responseBody,
        };
      }

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      } else {
        return {
          success: false,
          status: response.status,
          body: responseBody,
        };
      }
    } catch (error) {
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      } else {
        return {
          success: false,
          body: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  }

  return { success: false };
}

function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function dispatchWebhook({
  shopId,
  event,
  data,
}: DispatchWebhookParams): Promise<number> {
  const { data: endpoints, error } = await supabase
    .from("webhook_endpoints")
    .select("*")
    .eq("shop_id", shopId)
    .eq("active", true)
    .contains("events", [event]);

  if (error || !endpoints) {
    console.error("Failed to fetch webhook endpoints:", error);
    return 0;
  }

  let dispatchedCount = 0;

  for (const endpoint of endpoints) {
    const webhookId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const payload = {
      id: webhookId,
      event,
      data,
      timestamp,
    };

    const payloadString = JSON.stringify(payload);
    const signature = generateSignature(payloadString, endpoint.secret);

    const result = await sendWebhookWithRetry(
      endpoint as WebhookEndpoint,
      payload,
      signature,
      event
    );

    const deliveryRecord = {
      webhook_endpoint_id: endpoint.id,
      event,
      payload,
      response_status: result.status || null,
      response_body: result.body || null,
      attempts: 3,
      delivered_at: result.success ? new Date().toISOString() : null,
      failed_at: !result.success ? new Date().toISOString() : null,
    };

    await supabase.from("webhook_deliveries").insert(deliveryRecord);

    if (result.success) {
      await supabase
        .from("webhook_endpoints")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("id", endpoint.id);

      dispatchedCount++;
    }
  }

  return dispatchedCount;
}
