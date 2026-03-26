import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Handle Vonage SMS webhook for STOP keyword
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Vonage SMS format
    const { from: phone, text, to: businessNumber } = body;

    if (!phone || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedText = text.trim().toUpperCase();
    
    // Check for STOP keywords (TCPA compliant)
    const stopKeywords = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"];
    const isStopRequest = stopKeywords.some(keyword => normalizedText === keyword);

    if (!isStopRequest) {
      return NextResponse.json({ message: "Not a stop request" });
    }

    // Find shop by phone number (assuming Vonage number is associated with shop)
    // For now, we'll search across all shops and opt out from all of them
    const { data: customers, error: findError } = await supabase
      .from("customers")
      .select("id, shop_id, sms_opted_out")
      .eq("phone", phone);

    if (findError) {
      console.error("Find customers error:", findError);
      return NextResponse.json(
        { error: "Failed to process stop request" },
        { status: 500 }
      );
    }

    if (!customers || customers.length === 0) {
      // Log opt-out even if customer doesn't exist
      console.log(`STOP request from unknown number: ${phone}`);
      
      return NextResponse.json({
        message: "Stop request processed (no customer found)",
      });
    }

    // Update all customer records with this phone number
    const updates = customers
      .filter(c => !c.sms_opted_out)
      .map(async (customer) => {
        // Update customer
        await supabase
          .from("customers")
          .update({
            sms_opted_out: true,
            sms_opted_out_at: new Date().toISOString(),
            sms_opt_out_reason: "STOP",
          })
          .eq("id", customer.id);

        // Log opt-out
        await supabase.from("sms_opt_outs").insert({
          shop_id: customer.shop_id,
          customer_id: customer.id,
          phone,
          method: "STOP",
          ip_address: request.headers.get("x-forwarded-for") || request.ip || "unknown",
          user_agent: "Vonage SMS Webhook",
        });
      });

    await Promise.all(updates);

    // Send auto-reply (TCPA requirement)
    // Note: This would be handled by Vonage in production
    console.log(`STOP confirmed for ${phone}`);

    return NextResponse.json({
      message: "Stop request processed successfully",
      reply: "You have been unsubscribed. You will no longer receive SMS messages. Reply START to resubscribe.",
    });
  } catch (error) {
    console.error("STOP webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process stop request" },
      { status: 500 }
    );
  }
}

// Handle START keyword for resubscribe
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { from: phone, text } = body;

    if (!phone || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedText = text.trim().toUpperCase();
    
    const startKeywords = ["START", "UNSTOP", "YES"];
    const isStartRequest = startKeywords.some(keyword => normalizedText === keyword);

    if (!isStartRequest) {
      return NextResponse.json({ message: "Not a start request" });
    }

    // Find and re-enable all customers with this phone
    const { data: customers, error: findError } = await supabase
      .from("customers")
      .select("id, shop_id, sms_opted_out")
      .eq("phone", phone);

    if (findError) {
      console.error("Find customers error:", findError);
      return NextResponse.json(
        { error: "Failed to process start request" },
        { status: 500 }
      );
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json({
        message: "No customer found",
      });
    }

    // Re-enable SMS for all customer records
    const updates = customers
      .filter(c => c.sms_opted_out)
      .map(async (customer) => {
        await supabase
          .from("customers")
          .update({
            sms_opted_out: false,
            sms_opted_out_at: null,
            sms_opt_out_reason: null,
          })
          .eq("id", customer.id);
      });

    await Promise.all(updates);

    console.log(`START confirmed for ${phone}`);

    return NextResponse.json({
      message: "You have been resubscribed to SMS messages.",
    });
  } catch (error) {
    console.error("START webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process start request" },
      { status: 500 }
    );
  }
}
