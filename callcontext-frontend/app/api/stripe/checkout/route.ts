import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { stripe } from "@/lib/stripe/server";
import { ensureStripeCustomer } from "@/lib/stripe/helpers";
import { STRIPE_PLANS, type StripePlanKey } from "@/lib/stripe/plans";

const bodySchema = z.object({
  plan: z.enum(["starter", "pro", "growth"]),
});

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

  if (access.shop.owner_id !== user.id) {
    return NextResponse.json(
      { error: "Only the shop owner can manage billing." },
      { status: 403 }
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planDef = STRIPE_PLANS[body.plan as StripePlanKey];
  if (!planDef) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const customerId = await ensureStripeCustomer(
    access.shop,
    user.email || ""
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `CallContext ${planDef.name}`,
            metadata: { callcontext_plan: body.plan },
          },
          unit_amount: planDef.monthlyPriceCents,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      metadata: {
        shop_id: access.shop.id,
        callcontext_plan: body.plan,
      },
    },
    success_url: `${appUrl}/dashboard/settings/billing?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/dashboard/settings/billing`,
    metadata: { shop_id: access.shop.id },
  });

  return NextResponse.json({ url: session.url });
}
