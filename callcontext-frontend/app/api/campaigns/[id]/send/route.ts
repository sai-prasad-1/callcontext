import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDashboardAccess } from "@/lib/authz/server";
import { resend } from "@/lib/resend/client";

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

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .eq("shop_id", access.shop.id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status === "sent" || campaign.status === "sending") {
    return NextResponse.json(
      { error: "Campaign already sent or sending" },
      { status: 400 }
    );
  }

  await supabase
    .from("campaigns")
    .update({ status: "sending" } as never)
    .eq("id", id);

  let query = supabase
    .from("customers")
    .select("*")
    .eq("shop_id", access.shop.id);

  if (campaign.segment_filter) {
    const filter = campaign.segment_filter as Record<string, unknown>;

    if (filter.loyalty_tier) {
      query = query.eq("loyalty_tier", filter.loyalty_tier);
    }
    if (filter.tags && Array.isArray(filter.tags)) {
      query = query.contains("tags", filter.tags);
    }
    if (filter.min_lifetime_value) {
      query = query.gte("lifetime_value", filter.min_lifetime_value);
    }
    if (filter.max_lifetime_value) {
      query = query.lte("lifetime_value", filter.max_lifetime_value);
    }
  }

  if (campaign.type === "sms") {
    query = query.eq("communication_preference", "sms");
  }

  query = query.not("tags", "cs", '{"opted_out","unsubscribed"}');

  const { data: customers, error: customersError } = await query;

  if (customersError) {
    console.error("Error fetching customers:", customersError);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }

  let sent = 0;
  let failed = 0;

  for (const customer of customers || []) {
    try {
      if (campaign.type === "sms") {
        let message = campaign.content;
        message = message.replace(
          /\{\{first_name\}\}/g,
          customer.first_name || "Customer"
        );
        message = message.replace(
          /\{\{last_name\}\}/g,
          customer.last_name || ""
        );
        message = message.replace(/\{\{shop_name\}\}/g, access.shop.name);

        console.log(
          `[STUB] Sending SMS to ${customer.phone}:`,
          message.substring(0, 50)
        );

        sent++;
      } else if (campaign.type === "email") {
        if (!customer.email) {
          console.log(`Skipping customer ${customer.id}: no email`);
          continue;
        }

        let emailSubject = campaign.email_subject || "";
        let emailContent = campaign.email_content || "";

        const currentDate = new Date();
        const monthName = currentDate.toLocaleString("default", {
          month: "long",
        });
        const year = currentDate.getFullYear();

        emailSubject = emailSubject
          .replace(/\{\{first_name\}\}/g, customer.first_name || "Customer")
          .replace(/\{\{last_name\}\}/g, customer.last_name || "")
          .replace(/\{\{shop_name\}\}/g, access.shop.name)
          .replace(/\{\{month\}\}/g, monthName)
          .replace(/\{\{year\}\}/g, year.toString());

        emailContent = emailContent
          .replace(/\{\{first_name\}\}/g, customer.first_name || "Customer")
          .replace(/\{\{last_name\}\}/g, customer.last_name || "")
          .replace(/\{\{shop_name\}\}/g, access.shop.name)
          .replace(/\{\{month\}\}/g, monthName)
          .replace(/\{\{year\}\}/g, year.toString());

        const { error: emailError } = await resend.emails.send({
          from: "noreply@callcontext.ai",
          to: customer.email,
          subject: emailSubject,
          html: emailContent,
          tags: [
            { name: "campaign_id", value: campaign.id },
            { name: "customer_id", value: customer.id },
          ],
        });

        if (emailError) {
          console.error(`Failed to send email to ${customer.email}:`, emailError);
          failed++;
        } else {
          console.log(`Email sent to ${customer.email}`);
          sent++;
        }
      }
    } catch (error) {
      console.error(
        `Failed to send to ${campaign.type === "sms" ? customer.phone : customer.email}:`,
        error
      );
      failed++;
    }
  }

  const stats = (campaign.stats as Record<string, number>) || {};
  const updatedStats = {
    ...stats,
    sent,
    failed,
    delivered: sent,
  };

  await supabase
    .from("campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      stats: updatedStats,
    } as never)
    .eq("id", id);

  return NextResponse.json({ sent, failed });
}
