import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
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

  const testPhones = [
    { phone: "+1 (512) 555-0173", name: "Maria Chen" },
    { phone: "+1 (512) 555-0291", name: "James Rodriguez" },
    { phone: "+1 (512) 555-0482", name: "Sarah Kim" },
    { phone: "+1 (512) 555-0837", name: "David Park" },
    { phone: "+1 (512) 555-0629", name: "Lisa Thompson" },
  ];

  const randomCaller = testPhones[Math.floor(Math.random() * testPhones.length)];

  let customer = await supabase
    .from("customers")
    .select("*")
    .eq("shop_id", access.shop.id)
    .eq("phone", randomCaller.phone)
    .single()
    .then((res) => res.data);

  if (!customer) {
    const nameParts = randomCaller.name.split(" ");
    const { data: newCustomer } = await supabase
      .from("customers")
      .insert({
        shop_id: access.shop.id,
        phone: randomCaller.phone,
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(" "),
        first_contact_date: new Date().toISOString(),
        preferences: { primary: [], secondary: [], restrictions: [], notes: "" },
      })
      .select()
      .single();
    customer = newCustomer;
  }

  const callId = crypto.randomUUID();

  const { data: call, error } = await supabase
    .from("calls")
    .insert({
      id: callId,
      shop_id: access.shop.id,
      customer_id: customer?.id || null,
      direction: "inbound",
      status: "ringing",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create test call:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  setTimeout(async () => {
    await supabase
      .from("calls")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        duration_seconds: Math.floor(Math.random() * 180) + 60,
      })
      .eq("id", callId);
  }, 30000);

  return NextResponse.json({
    message: "Test call simulated",
    call: {
      id: callId,
      customer_name: randomCaller.name,
      customer_phone: randomCaller.phone,
      status: "ringing",
    },
  });
}
