import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadDashboardAccess } from "@/lib/authz/server";
import { z } from "zod";

type Params = {
  customerId: string;
};

const RedeemRewardSchema = z.object({
  reward_id: z.string(),
});

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

    const body = await request.json();
    const validated = RedeemRewardSchema.parse(body);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, shop_id, loyalty_points, first_name, last_name")
      .eq("id", customerId)
      .eq("shop_id", access.shop.id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const { data: shop } = await supabase
      .from("shops")
      .select("settings")
      .eq("id", access.shop.id)
      .single();

    const settings = shop?.settings as Record<string, unknown>;
    const loyalty = (settings?.loyalty as Record<string, unknown>) ?? {};
    const rewards = (loyalty.rewards as Array<{
      id: string;
      name: string;
      description: string;
      points_required: number;
    }>) ?? [];

    const reward = rewards.find((r) => r.id === validated.reward_id);
    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    if (customer.loyalty_points < reward.points_required) {
      return NextResponse.json(
        { error: "Insufficient points" },
        { status: 400 }
      );
    }

    const newBalance = customer.loyalty_points - reward.points_required;

    const { error: transactionError } = await supabase
      .from("loyalty_transactions")
      .insert({
        shop_id: access.shop.id,
        customer_id: customerId,
        type: "redeem",
        points: -reward.points_required,
        description: `Redeemed: ${reward.name}`,
      });

    if (transactionError) {
      throw transactionError;
    }

    const { error: updateError } = await supabase
      .from("customers")
      .update({
        loyalty_points: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    if (updateError) {
      throw updateError;
    }

    const customerName =
      [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
      "Customer";

    await supabase.from("notifications").insert({
      shop_id: access.shop.id,
      type: "loyalty_redemption",
      title: "Loyalty Reward Redeemed",
      message: `${customerName} redeemed ${reward.name} for ${reward.points_required} points`,
      link: `/dashboard/customers/${customerId}`,
    });

    return NextResponse.json({
      success: true,
      remaining_points: newBalance,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error redeeming reward:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
