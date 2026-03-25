import { createClient as createAdminClient } from "@supabase/supabase-js";
import { TWO_PARTY_STATES } from "@/lib/utils/constants";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type InsertShopOk = { ok: true };
export type InsertShopErr = {
  ok: false;
  error: string;
  details?: string;
  httpStatus: number;
};

/**
 * Inserts a shop (and owner membership via DB trigger) using the service role.
 * Use when the session user may not satisfy RLS (e.g. right after signup) or for onboarding.
 */
export async function insertShopForOwnerWithServiceRole(opts: {
  ownerId: string;
  shopName: string;
  country: string;
  state: string;
  timezone?: string;
}): Promise<InsertShopOk | InsertShopErr> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return {
      ok: false,
      error: "Server configuration error",
      details: "SUPABASE_SERVICE_ROLE_KEY is missing on the server.",
      httpStatus: 500,
    };
  }

  const consentMode = TWO_PARTY_STATES.has(opts.state)
    ? "always_disclose"
    : "auto";

  const shopPayload = {
    owner_id: opts.ownerId,
    name: opts.shopName.trim(),
    country: opts.country || "US",
    state: opts.state,
    consent_mode: consentMode as "auto" | "silent" | "always_disclose",
    timezone:
      opts.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    subscription_plan: "trial" as const,
    trial_ends_at: new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    ).toISOString(),
    settings: {},
  };

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey
  );

  let shopError: { message?: string; code?: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await adminSupabase.from("shops").insert([shopPayload] as any);
    shopError = error ?? null;

    if (!shopError) break;
    if (shopError.code !== "23503") break;

    await sleep(250 * (attempt + 1));
  }

  if (shopError) {
    const message = String(shopError.message || "");
    return {
      ok: false,
      error: "Failed to create shop",
      details:
        message.toLowerCase().includes("invalid api key")
          ? "Supabase service role key is invalid. Update SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the server."
          : shopError.code === "23503"
            ? "User record is still syncing. Please try again in a moment."
            : shopError.code === "42501"
              ? "Database permissions error. Ensure RLS policies allow shop creation."
              : message,
      httpStatus: 500,
    };
  }

  return { ok: true };
}
