import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { getShopConfig } from "@/lib/utils/shop-config";

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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
  const dateFrom = params.get("date_from");
  const dateTo = params.get("date_to");

  let query = supabase
    .from("customers")
    .select("*")
    .eq("shop_id", access.shop.id)
    .order("created_at", { ascending: false });

  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("created_at", dateTo);
  }

  const { data: customers, error } = await query;

  if (error) {
    console.error("GET /api/export/customers:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shopConfig = getShopConfig(access.shop.settings);

  const headers = [
    "First Name",
    "Last Name",
    "Phone",
    "Email",
    "Address",
    "City",
    "State",
    "Zip",
    "Tags",
    "Loyalty Tier",
    "Loyalty Points",
    "Total Orders",
    "Lifetime Value",
    shopConfig.preference_labels.primary,
    shopConfig.preference_labels.secondary,
    shopConfig.preference_labels.restrictions,
    "Created At",
    "Last Contact Date",
  ];

  const rows = (customers ?? []).map((c) => {
    const prefs = (c.preferences as Record<string, unknown>) ?? {};
    const primary = Array.isArray(prefs.primary)
      ? prefs.primary.join(", ")
      : "";
    const secondary = Array.isArray(prefs.secondary)
      ? prefs.secondary.join(", ")
      : "";
    const restrictions = Array.isArray(prefs.restrictions)
      ? prefs.restrictions.join(", ")
      : "";

    return [
      escapeCSV(c.first_name),
      escapeCSV(c.last_name),
      escapeCSV(c.phone),
      escapeCSV(c.email),
      escapeCSV(c.address),
      escapeCSV(c.city),
      escapeCSV(c.state),
      escapeCSV(c.zip),
      escapeCSV(Array.isArray(c.tags) ? c.tags.join(", ") : ""),
      escapeCSV(c.loyalty_tier),
      escapeCSV(c.loyalty_points),
      escapeCSV(c.total_orders),
      escapeCSV(c.lifetime_value),
      escapeCSV(primary),
      escapeCSV(secondary),
      escapeCSV(restrictions),
      escapeCSV(c.created_at),
      escapeCSV(c.last_contact_date),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  const today = new Date().toISOString().split("T")[0];
  const filename = `customers-${today}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
