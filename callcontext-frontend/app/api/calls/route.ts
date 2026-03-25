import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  sort: z.enum(["newest", "oldest", "duration_desc", "duration_asc"]).default("newest"),
  customer_id: z.string().uuid().optional(),
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

  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  const { page, limit, search, status, date_from, date_to, sort, customer_id } = parsed.data;

  let customerIdFilter: string[] | null = null;

  if (search) {
    const term = `%${search}%`;
    const { data: matches } = await supabase
      .from("customers")
      .select("id")
      .eq("shop_id", access.shop.id)
      .or(`first_name.ilike.${term},last_name.ilike.${term},phone.ilike.${term}`);
    customerIdFilter = (matches ?? []).map((c) => (c as { id: string }).id);
  }

  let query = supabase
    .from("calls")
    .select("*, customer:customers!customer_id(id, first_name, last_name, phone)", {
      count: "exact",
    })
    .eq("shop_id", access.shop.id);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (date_from) {
    query = query.gte("started_at", date_from);
  }

  if (date_to) {
    query = query.lte("started_at", date_to);
  }

  if (customer_id) {
    query = query.eq("customer_id", customer_id);
  } else if (customerIdFilter !== null) {
    if (customerIdFilter.length === 0) {
      return NextResponse.json({ calls: [], total: 0, page, totalPages: 0 });
    }
    query = query.in("customer_id", customerIdFilter);
  }

  switch (sort) {
    case "oldest":
      query = query.order("started_at", { ascending: true });
      break;
    case "duration_desc":
      query = query.order("duration_seconds", { ascending: false, nullsFirst: false });
      break;
    case "duration_asc":
      query = query.order("duration_seconds", { ascending: true, nullsFirst: false });
      break;
    default:
      query = query.order("started_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data: calls, count, error } = await query;

  if (error) {
    console.error("GET /api/calls:", error);
    return NextResponse.json({ error: "Failed to load calls" }, { status: 500 });
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({ calls: calls ?? [], total, page, totalPages });
}
