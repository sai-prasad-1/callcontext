import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const unsubscribeSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  shop_id: z.string().uuid("Invalid shop ID"),
});

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = unsubscribeSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { phone, shop_id } = validation.data;

  try {
    // Find customer by phone and shop
    const { data: customer, error: findError } = await supabase
      .from("customers")
      .select("id, sms_opted_out")
      .eq("phone", phone)
      .eq("shop_id", shop_id)
      .single();

    if (findError && findError.code !== "PGRST116") {
      console.error("Find customer error:", findError);
      return NextResponse.json(
        { error: "Failed to process unsubscribe" },
        { status: 500 }
      );
    }

    // If customer doesn't exist, just log the opt-out
    if (!customer) {
      const { error: logError } = await supabase.from("sms_opt_outs").insert({
        shop_id,
        phone,
        method: "WEB",
        ip_address: request.headers.get("x-forwarded-for") || request.ip || "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      });

      if (logError) {
        console.error("Log opt-out error:", logError);
        return NextResponse.json(
          { error: "Failed to process unsubscribe" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "You have been unsubscribed from SMS messages",
      });
    }

    // If already opted out, just return success
    if (customer.sms_opted_out) {
      return NextResponse.json({
        message: "You are already unsubscribed from SMS messages",
      });
    }

    // Update customer opt-out status
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        sms_opted_out: true,
        sms_opted_out_at: new Date().toISOString(),
        sms_opt_out_reason: "WEB",
      })
      .eq("id", customer.id);

    if (updateError) {
      console.error("Update customer error:", updateError);
      return NextResponse.json(
        { error: "Failed to process unsubscribe" },
        { status: 500 }
      );
    }

    // Log the opt-out for compliance
    const { error: logError } = await supabase.from("sms_opt_outs").insert({
      shop_id,
      customer_id: customer.id,
      phone,
      method: "WEB",
      ip_address: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    });

    if (logError) {
      console.error("Log opt-out error:", logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      message: "You have been unsubscribed from SMS messages",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to process unsubscribe" },
      { status: 500 }
    );
  }
}
