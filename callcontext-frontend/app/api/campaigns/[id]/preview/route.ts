import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const previewSchema = z.object({
  phone: z.string().min(1, "Phone is required"),
});

export async function POST(
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

  let body: z.infer<typeof previewSchema>;
  try {
    body = previewSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body", details: err },
      { status: 400 }
    );
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  let message = campaign.content;
  message = message.replace(/\{\{first_name\}\}/g, "Test");
  message = message.replace(/\{\{last_name\}\}/g, "User");
  message = message.replace(/\{\{shop_name\}\}/g, access.shop.name);

  console.log(`[PREVIEW] Sending test SMS to ${body.phone}:`, message);

  return NextResponse.json({ success: true, message });
}
