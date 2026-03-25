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
  const status = params.get("status");

  let query = supabase
    .from("orders")
    .select("*, customer:customers!customer_id(first_name, last_name, phone)")
    .eq("shop_id", access.shop.id)
    .order("created_at", { ascending: false });

  if (dateFrom) {
    query = query.gte("created_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("created_at", dateTo);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("GET /api/export/orders:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shopConfig = getShopConfig(access.shop.settings);

  const headers = [
    "Date",
    "Customer Name",
    "Customer Phone",
    "Products",
    shopConfig.service_labels.delivery,
    "Delivery Address",
    "Occasion",
    "Amount",
    "Status",
  ];

  const rows = (orders ?? []).map((order) => {
    const customer = order.customer as
      | { first_name?: string; last_name?: string; phone?: string }
      | null;
    const customerName = customer
      ? [customer.first_name, customer.last_name].filter(Boolean).join(" ")
      : "";

    const products = Array.isArray(order.products)
      ? order.products
          .map((p: { name?: string; quantity?: number }) => {
            const name = p.name || "Unknown";
            const qty = p.quantity || 1;
            return `${name} x ${qty}`;
          })
          .join("; ")
      : "";

    const date = order.created_at
      ? new Date(order.created_at).toLocaleDateString()
      : "";

    const deliveryDate = order.delivery_date
      ? new Date(order.delivery_date).toLocaleDateString()
      : "";

    return [
      escapeCSV(date),
      escapeCSV(customerName),
      escapeCSV(customer?.phone),
      escapeCSV(products),
      escapeCSV(deliveryDate),
      escapeCSV(order.delivery_address),
      escapeCSV(order.occasion),
      escapeCSV(order.total_amount),
      escapeCSV(order.status),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  const today = new Date().toISOString().split("T")[0];
  const filename = `orders-${today}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
