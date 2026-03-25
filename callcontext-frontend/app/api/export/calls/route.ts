import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
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
    .from("calls")
    .select("*, customer:customers!customer_id(first_name, last_name, phone)")
    .eq("shop_id", access.shop.id)
    .order("started_at", { ascending: false });

  if (dateFrom) {
    query = query.gte("started_at", dateFrom);
  }

  if (dateTo) {
    query = query.lte("started_at", dateTo);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: calls, error } = await query;

  if (error) {
    console.error("GET /api/export/calls:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "Date",
    "Time",
    "Customer Name",
    "Customer Phone",
    "Direction",
    "Status",
    "Duration",
    "Sentiment",
    "AI Summary",
    "Follow-up Needed",
  ];

  const rows = (calls ?? []).map((call) => {
    const customer = call.customer as
      | { first_name?: string; last_name?: string; phone?: string }
      | null;
    const customerName = customer
      ? [customer.first_name, customer.last_name].filter(Boolean).join(" ")
      : "";

    const startedAt = new Date(call.started_at);
    const date = startedAt.toLocaleDateString();
    const time = startedAt.toLocaleTimeString();

    return [
      escapeCSV(date),
      escapeCSV(time),
      escapeCSV(customerName),
      escapeCSV(customer?.phone),
      escapeCSV(call.direction),
      escapeCSV(call.status),
      escapeCSV(formatDuration(call.duration_seconds)),
      escapeCSV(call.sentiment),
      escapeCSV(call.ai_summary),
      escapeCSV(call.follow_up_needed ? "Yes" : "No"),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  const today = new Date().toISOString().split("T")[0];
  const filename = `calls-${today}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
