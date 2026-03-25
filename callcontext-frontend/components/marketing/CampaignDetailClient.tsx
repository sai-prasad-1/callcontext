"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Calendar,
  Edit,
  Trash2,
  Copy,
  Eye,
  MessageSquare,
  Mail,
  Users,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CampaignStats } from "./CampaignStats";
import { SMSPreview } from "./SMSPreview";
import { cn } from "@/lib/utils/formatting";
import type { Campaign } from "@/lib/types/database";

interface Props {
  campaign: Campaign;
  segmentName: string;
  customerCount: number;
  shopName: string;
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

export function CampaignDetailClient({
  campaign,
  segmentName,
  customerCount,
  shopName,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const canEdit = campaign.status === "draft" || campaign.status === "scheduled";
  const canDelete = campaign.status === "draft" || campaign.status === "scheduled";
  const canSend = campaign.status === "draft" || campaign.status === "scheduled";
  const hasSent = campaign.status === "sent";

  const stats = (campaign.stats as {
    sent: number;
    delivered: number;
    failed: number;
    clicked?: number;
    opened?: number;
  }) || { sent: 0, delivered: 0, failed: 0 };

  const handleSend = async () => {
    if (!confirm("Are you sure you want to send this campaign now?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/send`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to send campaign");
      }

      alert("Campaign sent successfully!");
      router.refresh();
    } catch (error) {
      console.error("Failed to send campaign:", error);
      alert("Failed to send campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete campaign");
      }

      router.push("/dashboard/marketing/campaigns");
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      alert("Failed to delete campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = () => {
    alert("Duplicate functionality coming soon!");
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/marketing/campaigns"
        className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
      >
        <ArrowLeft size={16} />
        Back to campaigns
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-semibold text-warm-900">
              {campaign.name}
            </h1>
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full",
                STATUS_STYLES[campaign.status].color
              )}
            >
              {STATUS_STYLES[campaign.status].label}
            </span>
          </div>
          <p className="text-sm text-warm-600 mt-1">
            {campaign.type === "sms" ? "SMS Campaign" : "Email Campaign"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canSend && (
            <Button
              variant="primary"
              icon={Send}
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Now"}
            </Button>
          )}
          {canEdit && (
            <Button variant="secondary" icon={Edit} disabled>
              Edit
            </Button>
          )}
          {hasSent && (
            <Button variant="secondary" icon={Copy} onClick={handleDuplicate}>
              Duplicate
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              icon={Trash2}
              onClick={handleDelete}
              disabled={loading}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Stats (if sent) */}
      {hasSent && <CampaignStats stats={stats} />}

      {/* Campaign Details */}
      <div className="bg-white border border-warm-200 rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-warm-900 mb-4">
            Campaign Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                {campaign.type === "sms" ? (
                  <MessageSquare size={20} className="text-blue-600" />
                ) : (
                  <Mail size={20} className="text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-xs text-warm-500 uppercase font-medium">
                  Type
                </p>
                <p className="text-sm text-warm-900 mt-1">
                  {campaign.type === "sms" ? "SMS" : "Email"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-warm-500 uppercase font-medium">
                  Audience
                </p>
                <p className="text-sm text-warm-900 mt-1">{segmentName}</p>
                <p className="text-xs text-warm-600 mt-0.5">
                  {customerCount} customers
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-warm-500 uppercase font-medium">
                  Created
                </p>
                <p className="text-sm text-warm-900 mt-1">
                  {new Date(campaign.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {campaign.scheduled_at && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Calendar size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-warm-500 uppercase font-medium">
                    Scheduled For
                  </p>
                  <p className="text-sm text-warm-900 mt-1">
                    {new Date(campaign.scheduled_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {campaign.sent_at && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-warm-500 uppercase font-medium">
                    Sent At
                  </p>
                  <p className="text-sm text-warm-900 mt-1">
                    {new Date(campaign.sent_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-warm-150 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-warm-900">
              {campaign.type === "sms" ? "Message Content" : "Email Content"}
            </h3>
            {campaign.type === "sms" && (
              <Button
                variant="secondary"
                size="sm"
                icon={Eye}
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
            )}
          </div>

          {campaign.type === "sms" ? (
            <div className="space-y-4">
              {showPreview ? (
                <SMSPreview message={campaign.content} fromName={shopName} />
              ) : (
                <div className="bg-warm-50 border border-warm-200 rounded-lg p-4">
                  <p className="text-sm text-warm-700 whitespace-pre-wrap">
                    {campaign.content}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-warm-500 uppercase font-medium mb-1">
                  Subject
                </p>
                <p className="text-sm font-medium text-warm-900">
                  {campaign.subject}
                </p>
              </div>
              <div>
                <p className="text-xs text-warm-500 uppercase font-medium mb-1">
                  Content
                </p>
                <div className="bg-warm-50 border border-warm-200 rounded-lg p-4">
                  <p className="text-sm text-warm-700 whitespace-pre-wrap">
                    {campaign.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer List (if sent) */}
      {hasSent && (
        <div className="bg-white border border-warm-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-warm-900 mb-4">
            Recipients
          </h2>
          <div className="text-sm text-warm-600">
            <p>Campaign was sent to {stats.sent} customers.</p>
            <p className="mt-2">
              View detailed recipient list and delivery status in the customers
              section.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
