import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { z } from "zod";

type Params = {
  customerId: string;
};

const AdjustPointsSchema = z.object({
  points: z.number(),
  type: z.enum(["earn", "redeem", "adjustment"]),
  description: z.string(),
});

const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
};

function calculateTier(points: number, configTiers: typeof TIER_THRESHOLDS): string {
  if (points >= configTiers.platinum) return "platinum";
  if (points >= configTiers.gold) return "gold";
  if (points >= configTiers.silver) return "silver";
  return "bronze";
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { customerId } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const access = await loadDashboardAccess(user.id);
    if (!access) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (access.role !== "owner" && access.role !== "manager") {
      return NextResponse.json(
        { error: "Only owners and managers can adjust loyalty points" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = AdjustPointsSchema.parse(body);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, shop_id, loyalty_tier, loyalty_points")
      .eq("id", customerId)
      .eq("shop_id", access.shop.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const newBalance = customer.loyalty_points + validated.points;
    if (newBalance < 0) {
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      );
    }

    const { data: shop } = await supabase
      .from("shops")
      .select("settings")
      .eq("id", access.shop.id)
      .single();

    const settings = shop?.settings as Record<string, unknown>;
    const loyalty = (settings?.loyalty as Record<string, unknown>) ?? {};
    const configTiers = (loyalty.tiers as typeof TIER_THRESHOLDS) ?? TIER_THRESHOLDS;

    const oldTier = customer.loyalty_tier;
    const newTier = calculateTier(newBalance, configTiers);

    const { error: transactionError } = await supabase
      .from("loyalty_transactions")
      .insert({
        shop_id: access.shop.id,
        customer_id: customerId,
        type: validated.type,
        points: validated.points,
        description: validated.description,
      });

    if (transactionError) {
      throw transactionError;
    }

    const updateData: {
      loyalty_points: number;
      loyalty_tier?: string;
      updated_at: string;
    } = {
      loyalty_points: newBalance,
      updated_at: new Date().toISOString(),
    };

    if (newTier !== oldTier) {
      updateData.loyalty_tier = newTier;
    }

    const { error: updateError } = await supabase
      .from("customers")
      .update(updateData)
      .eq("id", customerId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      new_balance: newBalance,
      new_tier: newTier !== oldTier ? newTier : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error adjusting loyalty points:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
