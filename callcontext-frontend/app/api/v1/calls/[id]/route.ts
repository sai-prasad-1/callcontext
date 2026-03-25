import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { withApiKeyAuth, type ApiContext } from "../../middleware";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function handleGet(
  request: NextRequest,
  context: ApiContext,
  params: { id: string }
) {
  const { data: call, error } = await supabase
    .from("calls")
    .select("*")
    .eq("id", params.id)
    .eq("shop_id", context.shopId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }
    console.error("GET /api/v1/calls/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ call });
}

export const GET = withApiKeyAuth(handleGet);
