import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

/**
 * Returns resolved shop, role, plan, and allowed feature keys for the current session.
 * Use for client hydration or debugging; authorization for mutations must still be enforced server-side.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await getDashboardAccess(supabase, user.id);
  if (!access) {
    return NextResponse.json(
      { error: "No shop access", shop: null, role: null, plan: null, allowedFeatures: [] },
      { status: 404 }
    );
  }

  return NextResponse.json({
    shop: {
      id: access.shop.id,
      name: access.shop.name,
      subscription_plan: access.shop.subscription_plan,
      trial_ends_at: access.shop.trial_ends_at,
    },
    role: access.role,
    plan: access.plan,
    allowedFeatures: access.allowedFeatures,
  });
}
