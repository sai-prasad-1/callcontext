import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { mergeShopSettings, type BillingMode } from "@/lib/shop/billing-settings";

const patchSchema = z.object({
  usage_billing_enabled: z.boolean().optional(),
  preferred_billing_mode: z.enum(["subscription", "usage", "hybrid"]).optional(),
});

export async function PATCH(request: NextRequest) {
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

  if (access.shop.owner_id !== user.id) {
    return NextResponse.json(
      { error: "Only the shop owner can update billing preferences." },
      { status: 403 }
    );
  }

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (
    body.usage_billing_enabled === undefined &&
    body.preferred_billing_mode === undefined
  ) {
    return NextResponse.json({ error: "No changes" }, { status: 400 });
  }

  const currentSettings =
    access.shop.settings && typeof access.shop.settings === "object"
      ? (access.shop.settings as Record<string, unknown>)
      : {};

  const nextSettings = mergeShopSettings(currentSettings, {
    usage_billing_enabled: body.usage_billing_enabled,
    preferred_billing_mode: body.preferred_billing_mode as BillingMode | undefined,
  });

  const { error } = await supabase
    .from("shops")
    .update({ settings: nextSettings } as never)
    .eq("id", access.shop.id);

  if (error) {
    console.error("billing patch:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, settings: nextSettings });
}
