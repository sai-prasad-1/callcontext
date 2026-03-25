import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import crypto from "crypto";

const createWebhookSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  events: z.array(z.string()).min(1, "At least one event is required"),
  description: z.string().optional(),
});

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

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

  const { data: endpoints, error } = await supabase
    .from("webhook_endpoints")
    .select("id, url, events, description, active, last_triggered_at, created_at")
    .eq("shop_id", access.shop.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/webhooks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ endpoints: endpoints ?? [] });
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

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = createWebhookSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { url, events, description } = validation.data;
  const secret = generateWebhookSecret();

  const { data: endpoint, error } = await supabase
    .from("webhook_endpoints")
    .insert({
      shop_id: access.shop.id,
      url,
      events,
      description,
      secret,
      active: true,
    })
    .select("id, url, events, description, active, secret, created_at")
    .single();

  if (error) {
    console.error("POST /api/webhooks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    endpoint,
    message: "Save this secret now, you won't see it again",
  });
}
