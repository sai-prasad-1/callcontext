import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import crypto from "crypto";

const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(24);
  return "ck_" + randomBytes.toString("hex");
}

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
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

  if (access.role !== "owner") {
    return NextResponse.json(
      { error: "Only shop owners can manage API keys" },
      { status: 403 }
    );
  }

  const { data: keys, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, last_used_at, total_requests, revoked, created_at")
    .eq("shop_id", access.shop.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/api-keys:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ keys: keys ?? [] });
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

  if (access.role !== "owner") {
    return NextResponse.json(
      { error: "Only shop owners can manage API keys" },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validation = createApiKeySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors[0].message },
      { status: 400 }
    );
  }

  const { name } = validation.data;
  const apiKey = generateApiKey();
  const keyHash = hashApiKey(apiKey);
  const keyPrefix = apiKey.substring(0, 10) + "...";

  const { data: newKey, error } = await supabase
    .from("api_keys")
    .insert({
      shop_id: access.shop.id,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
    })
    .select("id, name, key_prefix, last_used_at, total_requests, revoked, created_at")
    .single();

  if (error) {
    console.error("POST /api/api-keys:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    key: apiKey,
    keyData: newKey,
    message: "Save this key now, you won't see it again",
  });
}
