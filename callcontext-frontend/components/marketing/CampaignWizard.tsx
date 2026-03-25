"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Mail,
  Users,
  Calendar,
  Send,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SMSPreview } from "./SMSPreview";
import { EmailComposer } from "./EmailComposer";
import { EmailPreview } from "./EmailPreview";
import { cn } from "@/lib/utils/formatting";

interface Segment {
  id: string;
  name: string;
  filter: Record<string, unknown>;
  customer_count?: number;
}

interface Props {
  segments: Segment[];
  shopName: string;
}

type CampaignType = "sms" | "email";
type CampaignStatus = "draft" | "scheduled";

interface CampaignData {
  name: string;
  type: CampaignType;
  segment_filter: Record<string, unknown> | null;
  message_content: string;
  email_subject: string;
  email_content: string;
  scheduled_for: string | null;
  status: CampaignStatus;
}

const STEPS = [
  { id: 1, title: "Type", icon: MessageSquare },
  { id: 2, title: "Audience", icon: Users },
  { id: 3, title: "Compose", icon: Mail },
  { id: 4, title: "Schedule", icon: Calendar },
  { id: 5, title: "Review", icon: Eye },
];

export function CampaignWizard({ segments, shopName }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<CampaignData>({
    name: "",
    type: "sms",
    segment_filter: null,
    message_content: "",
    email_subject: "",
    email_content: "",
    scheduled_for: null,
    status: "draft",
  });

  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [sendTiming, setSendTiming] = useState<"now" | "later">("now");

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.type !== null && data.name.trim().length > 0;
      case 2:
        return data.segment_filter !== null;
      case 3:
        if (data.type === "sms") {
          return data.message_content.trim().length > 0;
        } else {
          return (
            data.email_subject.trim().length > 0 &&
            data.email_content.trim().length > 0
          );
        }
      case 4:
        return sendTiming === "now" || data.scheduled_for !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const insertToken = (token: string) => {
    const textarea = document.getElementById(
      "message-textarea"
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = data.message_content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + token + after;
      setData({ ...data, message_content: newText });
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + token.length,
          start + token.length
        );
      }, 0);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        type: data.type,
        segment_filter: data.segment_filter,
        message_content: data.type === "sms" ? data.message_content : undefined,
        email_subject: data.type === "email" ? data.email_subject : undefined,
        email_content: data.type === "email" ? data.email_content : undefined,
        scheduled_for: data.scheduled_for,
        status: sendTiming === "now" ? "draft" : "scheduled",
      };

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create campaign");
      }

      const { campaign } = await res.json();
      router.push(`/dashboard/marketing/campaigns/${campaign.id}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert("Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-900">
          Create Campaign
        </h1>
        <p className="text-sm text-warm-600 mt-1">
          Create and schedule marketing campaigns
        </p>
      </div>

      {/* Step indicator */}
      <div className="bg-white border border-warm-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    currentStep >= step.id
                      ? "bg-brand-500 border-brand-500 text-white"
                      : "bg-white border-warm-300 text-warm-500"
                  )}
                >
                  <step.icon size={20} />
                </div>
                <p
                  className={cn(
                    "text-xs mt-2 font-medium",
                    currentStep >= step.id
                      ? "text-brand-600"
                      : "text-warm-500"
                  )}
                >
                  {step.title}
                </p>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-16 h-0.5 mx-2 -mt-7 transition-colors",
                    currentStep > step.id ? "bg-brand-500" : "bg-warm-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white border border-warm-200 rounded-lg p-6 min-h-[400px]">
        {/* Step 1: Type */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-warm-900">
                Campaign Name & Type
              </h2>
              <p className="text-sm text-warm-600 mt-1">
                Choose your campaign type and give it a name
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Campaign Name
              </label>
              <Input
                placeholder="e.g., Spring Sale SMS"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-3">
                Campaign Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setData({ ...data, type: "sms" })}
                  className={cn(
                    "p-6 border-2 rounded-lg transition-all duration-150",
                    data.type === "sms"
                      ? "border-brand-500 bg-brand-50"
                      : "border-warm-200 hover:border-warm-300"
                  )}
                >
                  <MessageSquare
                    size={32}
                    className={cn(
                      "mb-3",
                      data.type === "sms" ? "text-brand-600" : "text-warm-400"
                    )}
                  />
                  <h3 className="font-semibold text-warm-900">SMS</h3>
                  <p className="text-sm text-warm-600 mt-1">
                    Send text messages to your customers
                  </p>
                </button>

                <button
                  onClick={() => setData({ ...data, type: "email" })}
                  className={cn(
                    "p-6 border-2 rounded-lg transition-all duration-150",
                    data.type === "email"
                      ? "border-brand-500 bg-brand-50"
                      : "border-warm-200 hover:border-warm-300"
                  )}
                >
                  <Mail
                    size={32}
                    className={cn(
                      "mb-3",
                      data.type === "email" ? "text-brand-600" : "text-warm-400"
                    )}
                  />
                  <h3 className="font-semibold text-warm-900">Email</h3>
                  <p className="text-sm text-warm-600 mt-1">
                    Send email campaigns to your audience
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Audience */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-warm-900">
                Select Audience
              </h2>
              <p className="text-sm text-warm-600 mt-1">
                Choose which customers will receive this campaign
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Customer Segment
              </label>
              <div className="space-y-2">
                {segments.map((segment) => (
                  <button
                    key={segment.id}
                    onClick={() => {
                      setSelectedSegment(segment);
                      setData({ ...data, segment_filter: segment.filter });
                    }}
                    className={cn(
                      "w-full p-4 border-2 rounded-lg text-left transition-all duration-150",
                      selectedSegment?.id === segment.id
                        ? "border-brand-500 bg-brand-50"
                        : "border-warm-200 hover:border-warm-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-warm-900">
                          {segment.name}
                        </h3>
                        <p className="text-sm text-warm-600 mt-0.5">
                          {segment.customer_count || 0} customers
                        </p>
                      </div>
                      <Users
                        size={24}
                        className={
                          selectedSegment?.id === segment.id
                            ? "text-brand-600"
                            : "text-warm-400"
                        }
                      />
                    </div>
                  </button>
                ))}
                {segments.length === 0 && (
                  <div className="text-center py-8 text-warm-500">
                    No segments available. Create a segment first.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Compose */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-warm-900">
                Compose Message
              </h2>
              <p className="text-sm text-warm-600 mt-1">
                Write your {data.type === "sms" ? "SMS" : "email"} message
              </p>
            </div>

            {data.type === "sms" ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-2">
                      Message Content
                    </label>
                    <textarea
                      id="message-textarea"
                      className="w-full h-40 px-4 py-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      placeholder="Type your message here..."
                      value={data.message_content}
                      onChange={(e) =>
                        setData({ ...data, message_content: e.target.value })
                      }
                      maxLength={500}
                    />
                    <p className="text-xs text-warm-500 mt-1">
                      Recommended: 160 characters, Max: 500 characters
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-warm-700 mb-2">
                      Insert Personalization
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => insertToken("{{first_name}}")}
                      >
                        + First Name
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => insertToken("{{last_name}}")}
                      >
                        + Last Name
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => insertToken("{{shop_name}}")}
                      >
                        + Shop Name
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-warm-700 mb-3">
                    Preview
                  </p>
                  <SMSPreview message={data.message_content} fromName={shopName} />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <EmailComposer
                    value={{
                      subject: data.email_subject,
                      content: data.email_content,
                    }}
                    onChange={(newValue) =>
                      setData({
                        ...data,
                        email_subject: newValue.subject,
                        email_content: newValue.content,
                      })
                    }
                    shopName={shopName}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-warm-700 mb-3">
                    Preview
                  </p>
                  <EmailPreview
                    subject={data.email_subject}
                    content={data.email_content}
                    fromName={shopName}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Schedule */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-warm-900">
                Schedule Campaign
              </h2>
              <p className="text-sm text-warm-600 mt-1">
                Choose when to send this campaign
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setSendTiming("now");
                  setData({ ...data, scheduled_for: null, status: "draft" });
                }}
                className={cn(
                  "w-full p-4 border-2 rounded-lg text-left transition-all duration-150",
                  sendTiming === "now"
                    ? "border-brand-500 bg-brand-50"
                    : "border-warm-200 hover:border-warm-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <Send
                    size={24}
                    className={
                      sendTiming === "now" ? "text-brand-600" : "text-warm-400"
                    }
                  />
                  <div>
                    <h3 className="font-medium text-warm-900">Send now</h3>
                    <p className="text-sm text-warm-600 mt-0.5">
                      Campaign will be sent immediately upon review
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setSendTiming("later");
                  setData({ ...data, status: "scheduled" });
                }}
                className={cn(
                  "w-full p-4 border-2 rounded-lg text-left transition-all duration-150",
                  sendTiming === "later"
                    ? "border-brand-500 bg-brand-50"
                    : "border-warm-200 hover:border-warm-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <Calendar
                    size={24}
                    className={
                      sendTiming === "later" ? "text-brand-600" : "text-warm-400"
                    }
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-warm-900">
                      Schedule for later
                    </h3>
                    <p className="text-sm text-warm-600 mt-0.5">
                      Choose a specific date and time
                    </p>
                  </div>
                </div>
              </button>

              {sendTiming === "later" && (
                <div className="ml-10 mt-4">
                  <label className="block text-sm font-medium text-warm-700 mb-2">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={data.scheduled_for || ""}
                    onChange={(e) =>
                      setData({ ...data, scheduled_for: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-warm-900">
                Review Campaign
              </h2>
              <p className="text-sm text-warm-600 mt-1">
                Review all details before sending
              </p>
            </div>

            <div className="space-y-4">
              <div className="border border-warm-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-warm-500 uppercase font-medium">
                      Type
                    </p>
                    <p className="text-sm text-warm-900 mt-1 font-medium">
                      {data.type === "sms" ? "SMS Campaign" : "Email Campaign"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="border border-warm-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-warm-500 uppercase font-medium">
                      Audience
                    </p>
                    <p className="text-sm text-warm-900 mt-1 font-medium">
                      {selectedSegment?.name || "No segment selected"}
                    </p>
                    <p className="text-xs text-warm-600 mt-0.5">
                      {selectedSegment?.customer_count || 0} customers
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                  >
                    Edit
                  </Button>
                </div>
              </div>

              <div className="border border-warm-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-warm-500 uppercase font-medium">
                    {data.type === "sms" ? "Message" : "Email Content"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                  >
                    Edit
                  </Button>
                </div>
                {data.type === "sms" ? (
                  <p className="text-sm text-warm-700 whitespace-pre-wrap">
                    {data.message_content}
                  </p>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-warm-900">
                      {data.email_subject}
                    </p>
                    <p className="text-sm text-warm-700 mt-2">
                      {data.email_content.substring(0, 150)}
                      {data.email_content.length > 150 && "..."}
                    </p>
                  </div>
                )}
              </div>

              <div className="border border-warm-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-warm-500 uppercase font-medium">
                      Schedule
                    </p>
                    <p className="text-sm text-warm-900 mt-1 font-medium">
                      {sendTiming === "now"
                        ? "Send immediately"
                        : data.scheduled_for
                          ? new Date(data.scheduled_for).toLocaleString()
                          : "Not scheduled"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(4)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          icon={ArrowLeft}
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          Back
        </Button>

        {currentStep < 5 ? (
          <Button
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="primary"
            icon={Send}
            onClick={handleSubmit}
            disabled={loading || !canProceed()}
          >
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        )}
      </div>
    </div>
  );
}
