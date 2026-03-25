import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { insertShopForOwnerWithServiceRole } from "@/lib/shop/insert-shop-service-role";

const bodySchema = z.object({
  shopName: z.string().min(1, "Shop name is required").max(200),
  state: z.string().length(2, "Choose a valid state"),
  country: z.string().optional().default("US"),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await getDashboardAccess(supabase, user.id);
  if (existing) {
    return NextResponse.json(
      { error: "You already have a shop", details: "Open the dashboard instead." },
      { status: 409 }
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    const json = await request.json();
    body = bodySchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (body.country !== "US") {
    return NextResponse.json(
      {
        error: "Currently only available in the United States",
        details: "We're expanding to more countries soon!",
      },
      { status: 400 }
    );
  }

  const { error: healthError } = await supabase.from("shops").select("id").limit(1);
  if (healthError && healthError.code === "PGRST205") {
    return NextResponse.json(
      {
        error: "Database not set up",
        details: "Run Supabase migrations. See supabase/README.md.",
      },
      { status: 503 }
    );
  }

  const result = await insertShopForOwnerWithServiceRole({
    ownerId: user.id,
    shopName: body.shopName,
    country: body.country,
    state: body.state,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, details: result.details },
      { status: result.httpStatus }
    );
  }

  return NextResponse.json({ ok: true });
}
