import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { stripe } from "@/lib/stripe/server";
import { syncSubscriptionToShop } from "@/lib/stripe/helpers";

/**
 * Verifies a Stripe Checkout session after redirect and syncs to DB.
 * This is the primary mechanism for updating the shop plan after payment.
 * (Webhooks are the backup; this handles the immediate post-checkout sync.)
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

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

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "subscription.items.data.price.product"],
    });
  } catch (err: any) {
    console.error("Failed to retrieve Stripe session:", err?.message);
    return NextResponse.json(
      { error: "Could not verify checkout session" },
      { status: 400 }
    );
  }

  if (session.metadata?.shop_id !== access.shop.id) {
    return NextResponse.json(
      { error: "Session does not belong to this shop" },
      { status: 403 }
    );
  }

  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return NextResponse.json({
      verified: false,
      status: session.status,
      payment_status: session.payment_status,
    });
  }

  const sub = session.subscription;
  if (sub && typeof sub === "object") {
    await syncSubscriptionToShop(sub as any);
  }

  const plan =
    (sub && typeof sub === "object" ? (sub as any).metadata?.callcontext_plan : null) ??
    session.metadata?.callcontext_plan ??
    null;

  return NextResponse.json({
    verified: true,
    status: session.status,
    payment_status: session.payment_status,
    plan,
    subscription_id:
      typeof sub === "string" ? sub : typeof sub === "object" ? sub?.id : null,
  });
}
