import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const createCampaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["sms", "email"]),
  segment_filter: z.record(z.any()).optional(),
  message_content: z.string().optional(),
  email_subject: z.string().optional(),
  email_content: z.string().optional(),
  scheduled_for: z.string().optional(),
  status: z.enum(["draft", "scheduled"]).default("draft"),
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
  const type = params.get("type") as "sms" | "email" | null;
  const status = params.get("status") as
    | "draft"
    | "scheduled"
    | "sending"
    | "sent"
    | "cancelled"
    | null;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") ?? 20)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("campaigns")
    .select("*", { count: "exact" })
    .eq("shop_id", access.shop.id);

  if (type) {
    query = query.eq("type", type);
  }

  if (status) {
    query = query.eq("status", status);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data: campaigns, count, error } = await query;

  if (error) {
    console.error("GET /api/campaigns:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = count ?? 0;

  return NextResponse.json({
    campaigns: campaigns ?? [],
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

  let body: z.infer<typeof createCampaignSchema>;
  try {
    body = createCampaignSchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body", details: err },
      { status: 400 }
    );
  }

  const content =
    body.type === "sms"
      ? body.message_content || ""
      : body.email_content || "";

  if (!content) {
    return NextResponse.json(
      { error: "Content is required for campaign" },
      { status: 400 }
    );
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .insert({
      shop_id: access.shop.id,
      name: body.name,
      type: body.type,
      segment_filter: body.segment_filter ?? null,
      subject: body.email_subject ?? null,
      content,
      scheduled_at: body.scheduled_for ?? null,
      stats: {
        sent: 0,
        delivered: 0,
        failed: 0,
        clicked: 0,
        opened: 0,
      },
      status: body.status,
    } as never)
    .select()
    .single();

  if (error) {
    console.error("POST /api/campaigns:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ campaign }, { status: 201 });
}
