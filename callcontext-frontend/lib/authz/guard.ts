import { NextResponse } from "next/server";
import type { FeatureKey } from "@/lib/authz/features";
import { canAccessFeature } from "@/lib/authz/evaluate";
import type { ShopRole } from "@/lib/authz/roles";
import type { SubscriptionPlan } from "@/lib/authz/plans";

/** Use in Route Handlers after resolving role + plan from the shop. */
export function forbiddenUnlessFeature(
  role: ShopRole,
  plan: SubscriptionPlan,
  feature: FeatureKey
): NextResponse | null {
  if (!canAccessFeature(role, plan, feature)) {
    return NextResponse.json(
      { error: "This action is not available for your role or plan.", code: "FORBIDDEN" },
      { status: 403 }
    );
  }
  return null;
}
