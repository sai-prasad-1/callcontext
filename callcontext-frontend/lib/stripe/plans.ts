/**
 * Stripe price IDs and product metadata for each CallContext plan.
 *
 * These IDs are created once in Stripe Dashboard → Products and pasted here.
 * We create them on-the-fly via the bootstrap script / first checkout if they
 * don't exist yet (test mode convenience).
 */

export type StripePlanKey = "starter" | "pro" | "growth";

export interface StripePlanDef {
  name: string;
  monthlyPriceCents: number;
  callMinutesIncluded: number;
  features: string[];
  /** Set after bootstrap / lookup */
  stripePriceId?: string;
  stripeProductId?: string;
}

export const STRIPE_PLANS: Record<StripePlanKey, StripePlanDef> = {
  starter: {
    name: "Starter",
    monthlyPriceCents: 4900,
    callMinutesIncluded: 300,
    features: [
      "Up to 300 call minutes/mo",
      "Customer CRM",
      "Call transcription",
      "1 team member",
    ],
  },
  pro: {
    name: "Pro",
    monthlyPriceCents: 6900,
    callMinutesIncluded: 1000,
    features: [
      "Up to 1,000 call minutes/mo",
      "AI call insights",
      "5 team members",
      "Marketing campaigns",
      "Priority support",
    ],
  },
  growth: {
    name: "Growth",
    monthlyPriceCents: 9900,
    callMinutesIncluded: -1,
    features: [
      "Unlimited call minutes",
      "Advanced analytics",
      "Unlimited team members",
      "Custom integrations",
      "Dedicated account manager",
    ],
  },
};

export const USAGE_PRICE_PER_MINUTE_CENTS = 5; // $0.05
