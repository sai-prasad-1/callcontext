import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { applySegmentFilter, type SegmentFilter } from "@/lib/utils/segment-filters";

const updateSegmentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  filter: z.record(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  const { data: segment, error: segmentError } = await supabase
    .from("segments")
    .select("*")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .maybeSingle();

  if (segmentError) {
    console.error("GET /api/segments/[id]:", segmentError);
    return NextResponse.json(
      { error: segmentError.message },
      { status: 500 }
    );
  }

  if (!segment) {
    return NextResponse.json({ error: "Segment not found" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let customersQuery = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("shop_id", access.shop.id);

  customersQuery = applySegmentFilter(
    customersQuery,
    segment.filter as SegmentFilter
  );

  const filter = segment.filter as SegmentFilter;
  let customerIds: string[] | null = null;

  if (filter.total_calls_min !== undefined) {
    const { data: callData } = await supabase
      .from("calls")
      .select("customer_id")
      .eq("shop_id", access.shop.id)
      .not("customer_id", "is", null);

    if (callData) {
      const callCounts = callData.reduce(
        (acc, row) => {
          const id = row.customer_id as string;
          acc[id] = (acc[id] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      customerIds = Object.entries(callCounts)
        .filter(([_, count]) => count >= filter.total_calls_min!)
        .map(([id]) => id);

      if (customerIds.length === 0) {
        return NextResponse.json({
          segment,
          customers: [],
          total: 0,
          page,
          totalPages: 0,
        });
      }

      customersQuery = customersQuery.in("id", customerIds);
    }
  }

  customersQuery = customersQuery
    .order("last_contact_date", { ascending: false, nullsFirst: false })
    .range(from, to);

  const { data: customers, count, error: customersError } = await customersQuery;

  if (customersError) {
    console.error("GET /api/segments/[id] customers:", customersError);
    return NextResponse.json(
      { error: customersError.message },
      { status: 500 }
    );
  }

  const total = count ?? 0;

  return NextResponse.json({
    segment,
    customers: customers ?? [],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  const { data: segment, error: fetchError } = await supabase
    .from("segments")
    .select("*")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .maybeSingle();

  if (fetchError) {
    console.error("PATCH /api/segments/[id] fetch:", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!segment) {
    return NextResponse.json({ error: "Segment not found" }, { status: 404 });
  }

  if (segment.is_preset) {
    return NextResponse.json(
      { error: "Cannot edit preset segments" },
      { status: 403 }
    );
  }

  let body: z.infer<typeof updateSegmentSchema>;
  try {
    body = updateSegmentSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.filter !== undefined) updates.filter = body.filter;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ segment });
  }

  const { data: updated, error: updateError } = await supabase
    .from("segments")
    .update(updates as never)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("PATCH /api/segments/[id] update:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ segment: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  const { data: segment, error: fetchError } = await supabase
    .from("segments")
    .select("is_preset")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .maybeSingle();

  if (fetchError) {
    console.error("DELETE /api/segments/[id] fetch:", fetchError);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!segment) {
    return NextResponse.json({ error: "Segment not found" }, { status: 404 });
  }

  if (segment.is_preset) {
    return NextResponse.json(
      { error: "Cannot delete preset segments" },
      { status: 403 }
    );
  }

  const { error: deleteError } = await supabase
    .from("segments")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("DELETE /api/segments/[id]:", deleteError);
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
