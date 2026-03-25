import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { stripe } from "@/lib/stripe/server";

const bodySchema = z.object({
  minutes: z.number().min(0),
});

/**
 * Report call usage minutes to Stripe via Billing Meter Events.
 * In production this would be called from the telephony backend after each call.
 *
 * Prerequisites in Stripe Dashboard:
 * 1. Create a Billing Meter (name: "call_minutes", event_name: "call_minutes")
 * 2. Create a metered price attached to that meter
 * 3. Add the metered price to the customer's subscription
 */
export async function POST(request: NextRequest) {
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

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!access.shop.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer. Subscribe to a plan first." },
      { status: 400 }
    );
  }

  const quantity = Math.ceil(body.minutes);

  try {
    await stripe.billing.meterEvents.create({
      event_name: "call_minutes",
      payload: {
        stripe_customer_id: access.shop.stripe_customer_id,
        value: String(quantity),
      },
    });
  } catch (err: any) {
    console.error("Stripe meter event error:", err?.message);
    return NextResponse.json(
      {
        error: "Failed to report usage",
        details:
          err?.code === "resource_missing"
            ? 'Create a Billing Meter with event_name "call_minutes" in Stripe Dashboard first.'
            : err?.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, minutesReported: quantity });
}
