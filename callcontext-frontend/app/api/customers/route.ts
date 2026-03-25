import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { triggerWelcomeSMS } from "@/lib/automations/triggers";

const createCustomerSchema = z.object({
  phone: z.string().min(1, "Phone is required"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
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

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") ?? 20)));
  const search = params.get("search")?.trim() || null;
  const tag = params.get("tag")?.trim() || null;
  const sort = params.get("sort") ?? "last_contact";

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("shop_id", access.shop.id);

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  switch (sort) {
    case "name":
      query = query.order("first_name", { ascending: true });
      break;
    case "lifetime_value":
      query = query.order("lifetime_value", { ascending: false });
      break;
    case "total_orders":
      query = query.order("total_orders", { ascending: false });
      break;
    case "last_contact":
    default:
      query = query.order("last_contact_date", {
        ascending: false,
        nullsFirst: false,
      });
      break;
  }

  query = query.range(from, to);

  const { data: customers, count, error } = await query;

  if (error) {
    console.error("GET /api/customers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    customers: customers ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

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

  let body: z.infer<typeof createCustomerSchema>;
  try {
    body = createCustomerSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("shop_id", access.shop.id)
    .eq("phone", body.phone)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "A customer with this phone number already exists." },
      { status: 409 }
    );
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      shop_id: access.shop.id,
      phone: body.phone,
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      email: body.email ?? null,
      tags: body.tags ?? [],
      preferences: {
        primary: [],
        secondary: [],
        restrictions: [],
        notes: "",
      },
      first_contact_date: new Date().toISOString(),
    } as never)
    .select()
    .single();

  if (error) {
    console.error("POST /api/customers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shopSettings = (access.shop.settings as any) || {};
  const automationSettings = shopSettings.automations || {};
  const welcomeRule = automationSettings.welcome_sms || { enabled: true };

  try {
    await triggerWelcomeSMS({
      shop_id: access.shop.id,
      customer_id: customer.id,
      customer_phone: customer.phone,
      customer_first_name: customer.first_name,
      shop_name: access.shop.name,
      rule_config: {
        enabled: welcomeRule.enabled ?? true,
        template: welcomeRule.template ?? "Hi {{first_name}}! Thanks for contacting {{shop_name}}. We're excited to serve you!",
      },
    });
  } catch (err) {
    console.error("Failed to trigger welcome SMS:", err);
  }

  return NextResponse.json({ customer }, { status: 201 });
}
