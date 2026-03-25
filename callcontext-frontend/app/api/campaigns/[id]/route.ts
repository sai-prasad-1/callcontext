import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const updateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  segment_filter: z.record(z.any()).optional(),
  content: z.string().optional(),
  subject: z.string().optional(),
  scheduled_at: z.string().optional(),
  status: z.enum(["draft", "scheduled", "cancelled"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (error || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  return NextResponse.json({ campaign });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data: existing, error: fetchError } = await supabase
    .from("campaigns")
    .select("status")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (existing.status === "sent" || existing.status === "sending") {
    return NextResponse.json(
      { error: "Cannot edit a campaign that is sent or sending" },
      { status: 400 }
    );
  }

  let body: z.infer<typeof updateCampaignSchema>;
  try {
    body = updateCampaignSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body", details: err },
      { status: 400 }
    );
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .update(body as never)
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .select()
    .single();

  if (error) {
    console.error("PATCH /api/campaigns/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaign });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const { data: existing, error: fetchError } = await supabase
    .from("campaigns")
    .select("status")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (existing.status === "sent" || existing.status === "sending") {
    return NextResponse.json(
      { error: "Cannot delete a campaign that is sent or sending" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", id)
    .eq("shop_id", access.shop.id);

  if (error) {
    console.error("DELETE /api/campaigns/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
