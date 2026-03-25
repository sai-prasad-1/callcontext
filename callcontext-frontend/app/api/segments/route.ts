import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { countSegmentCustomers, type SegmentFilter } from "@/lib/utils/segment-filters";

const createSegmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  filter: z.record(z.any()),
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

  const { data: segments, error } = await supabase
    .from("segments")
    .select("*")
    .eq("shop_id", access.shop.id)
    .order("is_preset", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/segments:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const segmentsWithCounts = await Promise.all(
    (segments ?? []).map(async (segment) => {
      const count = await countSegmentCustomers(
        supabase,
        access.shop.id,
        segment.filter as SegmentFilter
      );
      return { ...segment, customer_count: count };
    })
  );

  return NextResponse.json({ segments: segmentsWithCounts });
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

  let body: z.infer<typeof createSegmentSchema>;
  try {
    body = createSegmentSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: segment, error } = await supabase
    .from("segments")
    .insert({
      shop_id: access.shop.id,
      name: body.name,
      description: body.description ?? null,
      filter: body.filter,
      is_preset: false,
    } as never)
    .select()
    .single();

  if (error) {
    console.error("POST /api/segments:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ segment }, { status: 201 });
}
