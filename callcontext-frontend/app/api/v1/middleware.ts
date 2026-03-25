import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import crypto from "crypto";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const rateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();

const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(shopId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(shopId);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(shopId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

setInterval(cleanupRateLimits, 60000);

function hashApiKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export interface ApiContext {
  shopId: string;
}

type ApiHandler = (
  request: NextRequest,
  context: ApiContext,
  params?: any
) => Promise<NextResponse>;

export function withApiKeyAuth(handler: ApiHandler): any {
  return async (
    request: NextRequest,
    routeContext?: { params: Promise<any> }
  ) => {
    const apiKey = request.headers.get("X-API-Key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing X-API-Key header" },
        { status: 401 }
      );
    }

    const keyHash = hashApiKey(apiKey);

    const { data: apiKeyRecord, error } = await supabase
      .from("api_keys")
      .select("id, shop_id, revoked, total_requests")
      .eq("key_hash", keyHash)
      .single();

    if (error || !apiKeyRecord) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (apiKeyRecord.revoked) {
      return NextResponse.json(
        { error: "API key has been revoked" },
        { status: 401 }
      );
    }

    if (!checkRateLimit(apiKeyRecord.shop_id)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 100 requests per minute." },
        { status: 429 }
      );
    }

    await supabase
      .from("api_keys")
      .update({
        last_used_at: new Date().toISOString(),
        total_requests: (apiKeyRecord.total_requests || 0) + 1,
      })
      .eq("id", apiKeyRecord.id);

    const context: ApiContext = {
      shopId: apiKeyRecord.shop_id,
    };

    const params = routeContext?.params ? await routeContext.params : undefined;

    return handler(request, context, params);
  };
}
