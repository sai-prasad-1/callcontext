import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { countSegmentCustomers, type SegmentFilter } from "@/lib/utils/segment-filters";

const countSchema = z.object({
  filter: z.record(z.any()),
});

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

  let body: z.infer<typeof countSchema>;
  try {
    body = countSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const count = await countSegmentCustomers(
    supabase,
    access.shop.id,
    body.filter as SegmentFilter
  );

  return NextResponse.json({ count });
}
