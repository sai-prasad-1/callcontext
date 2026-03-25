import { stripe } from "./server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/**
 * Ensure a shop has a Stripe customer. Creates one if missing and
 * writes the ID back to `shops.stripe_customer_id`.
 */
export async function ensureStripeCustomer(shop: {
  id: string;
  name: string;
  stripe_customer_id: string | null;
  owner_id: string;
}, ownerEmail: string): Promise<string> {
  if (shop.stripe_customer_id) return shop.stripe_customer_id;

  const customer = await stripe.customers.create({
    email: ownerEmail,
    name: shop.name,
    metadata: { shop_id: shop.id, owner_id: shop.owner_id },
  });

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await admin
    .from("shops")
    .update({ stripe_customer_id: customer.id } as never)
    .eq("id", shop.id);

  return customer.id;
}

/**
 * Syncs a Stripe subscription status back to the shops table.
 * Handles plan resolution from multiple metadata sources.
 */
export async function syncSubscriptionToShop(subscription: {
  id: string;
  customer: string;
  status: string;
  metadata?: Record<string, string>;
  items: { data: Array<{ price: { id: string; product: string | { id: string }; metadata?: Record<string, string> } }> };
}) {
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : (subscription.customer as any)?.id ?? subscription.customer;

  const { data: shop } = await admin
    .from("shops")
    .select("id, subscription_plan")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (!shop) {
    console.error(`syncSubscriptionToShop: No shop found for customer ${customerId}`);
    return;
  }

  const planFromMetadata = resolveCallcontextPlan(subscription);

  const update: Record<string, unknown> = {
    stripe_subscription_id: subscription.id,
  };

  if (subscription.status === "active" || subscription.status === "trialing") {
    if (planFromMetadata) update.subscription_plan = planFromMetadata;
    update.trial_ends_at = null;
  } else if (
    subscription.status === "canceled" ||
    subscription.status === "unpaid" ||
    subscription.status === "past_due"
  ) {
    if (subscription.status === "canceled") {
      update.subscription_plan = "trial";
      update.stripe_subscription_id = null;
    }
  }

  console.log(`syncSubscriptionToShop: shop=${shop.id} sub=${subscription.id} status=${subscription.status} plan=${planFromMetadata}`);

  await admin
    .from("shops")
    .update(update as never)
    .eq("id", shop.id);
}

/**
 * Resolve the CallContext plan key from every available metadata source:
 * 1. subscription.metadata.callcontext_plan (set in checkout)
 * 2. price.metadata.callcontext_plan
 * 3. product.metadata.callcontext_plan (if product was expanded)
 */
function resolveCallcontextPlan(sub: {
  metadata?: Record<string, string>;
  items: { data: Array<{ price: { id: string; product: string | { id: string; metadata?: Record<string, string> }; metadata?: Record<string, string> } }> };
}): string | null {
  if (sub.metadata?.callcontext_plan) {
    return sub.metadata.callcontext_plan;
  }

  for (const item of sub.items.data) {
    if (item.price.metadata?.callcontext_plan) {
      return item.price.metadata.callcontext_plan;
    }

    const product = item.price.product;
    if (typeof product === "object" && product.metadata?.callcontext_plan) {
      return product.metadata.callcontext_plan;
    }
  }

  return null;
}
