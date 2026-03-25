"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MessageSquare, Mail, Calendar, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/formatting";
import type { Campaign } from "@/lib/types/database";

interface Props {
  campaigns: Campaign[];
}

const STATUS_STYLES: Record<
  Campaign["status"],
  { color: string; label: string }
> = {
  draft: { color: "bg-gray-100 text-gray-700", label: "Draft" },
  scheduled: { color: "bg-blue-100 text-blue-700", label: "Scheduled" },
  sending: { color: "bg-amber-100 text-amber-700", label: "Sending" },
  sent: { color: "bg-green-100 text-green-700", label: "Sent" },
  cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
};

export function CampaignListClient({ campaigns: initialCampaigns }: Props) {
  const [campaigns] = useState<Campaign[]>(initialCampaigns);
  const [filter, setFilter] = useState<"all" | "sms" | "email">("all");

  const filteredCampaigns = campaigns.filter((c) => {
    if (filter === "all") return true;
    return c.type === filter;
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-warm-900">
            Campaigns
          </h1>
          <p className="text-sm text-warm-600 mt-1">
            Create and manage marketing campaigns
          </p>
        </div>
        <Link href="/dashboard/marketing/campaigns/new">
          <Button variant="primary" icon={Plus}>
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            filter === "all"
              ? "bg-brand-500 text-white"
              : "bg-white border border-warm-200 text-warm-700 hover:bg-warm-50"
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilter("sms")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
            filter === "sms"
              ? "bg-brand-500 text-white"
              : "bg-white border border-warm-200 text-warm-700 hover:bg-warm-50"
          )}
        >
          <MessageSquare size={16} />
          SMS
        </button>
        <button
          onClick={() => setFilter("email")}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
            filter === "email"
              ? "bg-brand-500 text-white"
              : "bg-white border border-warm-200 text-warm-700 hover:bg-warm-50"
          )}
        >
          <Mail size={16} />
          Email
        </button>
      </div>

      {filteredCampaigns.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No campaigns yet"
          description="Create your first marketing campaign to reach your customers."
          action={
            <Link href="/dashboard/marketing/campaigns/new">
              <Button variant="primary" icon={Plus}>
                Create Campaign
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => {
            const stats = (campaign.stats as {
              sent?: number;
              delivered?: number;
            }) || {};

            return (
              <Link
                key={campaign.id}
                href={`/dashboard/marketing/campaigns/${campaign.id}`}
                className="block group"
              >
                <div className="bg-white border border-warm-200 rounded-lg p-5 transition-all duration-150 hover:shadow-md hover:border-warm-300 group-focus-visible:ring-2 group-focus-visible:ring-brand-500 group-focus-visible:ring-offset-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={cn(
                          "p-3 rounded-lg",
                          campaign.type === "sms"
                            ? "bg-blue-50"
                            : "bg-purple-50"
                        )}
                      >
                        {campaign.type === "sms" ? (
                          <MessageSquare
                            size={24}
                            className="text-blue-600"
                          />
                        ) : (
                          <Mail size={24} className="text-purple-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-warm-900 truncate">
                            {campaign.name}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full shrink-0",
                              STATUS_STYLES[campaign.status].color
                            )}
                          >
                            {STATUS_STYLES[campaign.status].label}
                          </span>
                        </div>

                        <p className="text-sm text-warm-600 line-clamp-2 mb-2">
                          {campaign.content.substring(0, 120)}
                          {campaign.content.length > 120 && "..."}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-warm-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {campaign.status === "sent" && stats.sent && (
                            <div className="flex items-center gap-1">
                              <Send size={14} />
                              <span>
                                {stats.sent} sent
                                {stats.delivered &&
                                  ` · ${stats.delivered} delivered`}
                              </span>
                            </div>
                          )}

                          {campaign.scheduled_at && campaign.status === "scheduled" && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>
                                Scheduled for{" "}
                                {new Date(
                                  campaign.scheduled_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
