import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { triggerPostDeliveryFollowup } from "@/lib/automations/triggers";

type RouteContext = { params: Promise<{ id: string }> };

const updateOrderSchema = z.object({
  products: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().nonnegative(),
      })
    )
    .optional(),
  delivery_date: z.string().optional(),
  delivery_address: z.string().optional(),
  occasion: z.string().optional(),
  special_instructions: z.string().optional(),
  total_amount: z.number().nonnegative().optional(),
  status: z.enum(["pending", "confirmed", "delivered", "cancelled"]).optional(),
});

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

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

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, customer:customers!customer_id(id, first_name, last_name, phone)")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

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

  let body: z.infer<typeof updateOrderSchema>;
  try {
    body = updateOrderSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: existingOrder, error: fetchError } = await supabase
    .from("orders")
    .select("*, customer:customers!customer_id(id, total_orders, lifetime_value, loyalty_points, loyalty_tier)")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (fetchError || !existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const statusChanged = body.status && body.status !== existingOrder.status;

  if (statusChanged && body.status === "delivered") {
    const shopSettings = (access.shop.settings as { loyalty?: { enabled?: boolean; points_per_dollar?: number } }) || {};
    const loyaltyEnabled = shopSettings.loyalty?.enabled ?? false;

    if (loyaltyEnabled) {
      const pointsPerDollar = shopSettings.loyalty?.points_per_dollar ?? 0;
      const orderAmount = body.total_amount ?? existingOrder.total_amount ?? 0;
      const pointsToEarn = Math.floor(orderAmount * pointsPerDollar);

      if (pointsToEarn > 0) {
        const customer = existingOrder.customer as {
          id: string;
          total_orders?: number;
          lifetime_value?: number;
          loyalty_points?: number;
          loyalty_tier?: string;
        };

        const currentPoints = customer.loyalty_points ?? 0;
        const newPoints = currentPoints + pointsToEarn;

        let newTier: "bronze" | "silver" | "gold" | "platinum" = customer.loyalty_tier as "bronze" | "silver" | "gold" | "platinum" ?? "bronze";
        
        if (newPoints >= 1000) {
          newTier = "platinum";
        } else if (newPoints >= 500) {
          newTier = "gold";
        } else if (newPoints >= 250) {
          newTier = "silver";
        } else {
          newTier = "bronze";
        }

        await Promise.all([
          supabase.from("loyalty_transactions").insert({
            shop_id: access.shop.id,
            customer_id: existingOrder.customer_id,
            type: "earn",
            points: pointsToEarn,
            description: `Earned from order #${id.slice(0, 8)}`,
            order_id: id,
          } as never),
          supabase
            .from("customers")
            .update({
              loyalty_points: newPoints,
              loyalty_tier: newTier,
            } as never)
            .eq("id", existingOrder.customer_id),
        ]);
      }
    }

    const { data: customerData } = await supabase
      .from("customers")
      .select("phone, first_name")
      .eq("id", existingOrder.customer_id)
      .single();

    if (customerData) {
      const automationSettings = (shopSettings as any).automations || {};
      const followupRule = automationSettings.post_delivery_followup || { enabled: true };

      try {
        await triggerPostDeliveryFollowup({
          shop_id: access.shop.id,
          order_id: id,
          customer_id: existingOrder.customer_id,
          customer_phone: customerData.phone,
          customer_first_name: customerData.first_name,
          shop_name: access.shop.name,
          rule_config: {
            enabled: followupRule.enabled ?? true,
            template: followupRule.template ?? "Hi {{first_name}}, how was your recent order from {{shop_name}}? We'd love to hear your feedback!",
          },
        });
      } catch (err) {
        console.error("Failed to trigger post-delivery follow-up:", err);
      }
    }
  }

  if (statusChanged && body.status === "cancelled") {
    const customer = existingOrder.customer as {
      id: string;
      total_orders?: number;
      lifetime_value?: number;
    };

    const currentTotalOrders = customer.total_orders ?? 0;
    const currentLifetimeValue = customer.lifetime_value ?? 0;
    const orderAmount = existingOrder.total_amount ?? 0;

    if (currentTotalOrders > 0) {
      await supabase
        .from("customers")
        .update({
          total_orders: currentTotalOrders - 1,
          lifetime_value: Math.max(0, currentLifetimeValue - orderAmount),
        } as never)
        .eq("id", existingOrder.customer_id);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (body.products !== undefined) updateData.products = body.products;
  if (body.delivery_date !== undefined) updateData.delivery_date = body.delivery_date;
  if (body.delivery_address !== undefined) updateData.delivery_address = body.delivery_address;
  if (body.occasion !== undefined) updateData.occasion = body.occasion;
  if (body.special_instructions !== undefined) updateData.special_instructions = body.special_instructions;
  if (body.total_amount !== undefined) updateData.total_amount = body.total_amount;
  if (body.status !== undefined) updateData.status = body.status;

  const { data: order, error } = await supabase
    .from("orders")
    .update(updateData as never)
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .select()
    .single();

  if (error) {
    console.error("PATCH /api/orders/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

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

  if (access.role !== "owner" && access.role !== "manager") {
    return NextResponse.json(
      { error: "Only owners and managers can delete orders." },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id)
    .eq("shop_id", access.shop.id);

  if (error) {
    console.error("DELETE /api/orders/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
