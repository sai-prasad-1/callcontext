"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Play,
  Pause,
  Volume2,
  Sparkles,
  Package,
  Gift,
  Calendar,
  MapPin,
  DollarSign,
  Heart,
  Star,
  FileText,
  Clock,
  Mic,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  User,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/formatting";
import { formatDuration, formatPhone } from "@/lib/utils/formatting";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CallDetailClientProps {
  call: Record<string, unknown>;
  customer: Record<string, unknown> | null;
  linkedOrder: Record<string, unknown> | null;
  linkedReminders: Record<string, unknown>[];
  shopConfig: ShopIndustryConfig;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SENTIMENT: Record<
  string,
  { label: string; variant: "success" | "warning" | "danger"; emoji: string }
> = {
  positive: { label: "Positive", variant: "success", emoji: "😊" },
  neutral: { label: "Neutral", variant: "warning", emoji: "😐" },
  negative: { label: "Negative", variant: "danger", emoji: "😟" },
};

const STATUS_BADGE: Record<string, { label: string; variant: "danger" | "warning" }> = {
  missed: { label: "Missed", variant: "danger" },
  voicemail: { label: "Voicemail", variant: "warning" },
};

const SPEED_OPTIONS = [1, 1.25, 1.5, 2] as const;
const TRANSCRIPT_PREVIEW_LINES = 10;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCallDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCallTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface TranscriptLine {
  speaker: string;
  text: string;
  isCustomer: boolean;
}

function parseTranscript(raw: string): TranscriptLine[] {
  const lines: TranscriptLine[] = [];
  const regex = /^([\w\s]+?):\s*(.+)/;

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(regex);
    if (match) {
      const speaker = match[1].trim();
      const isCustomer = speaker.toLowerCase() === "customer";
      lines.push({ speaker, text: match[2], isCustomer });
    } else if (lines.length > 0) {
      lines[lines.length - 1].text += " " + trimmed;
    }
  }
  return lines;
}

function formatMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function EntityPill({
  icon: Icon,
  label,
}: {
  icon: typeof Package;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-warm-50 border border-warm-200 text-sm text-warm-800">
      <Icon size={14} className="text-warm-500 shrink-0" />
      {label}
    </span>
  );
}

function AudioPlayer({ duration }: { duration: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState<(typeof SPEED_OPTIONS)[number]>(1);
  const [volume, setVolume] = useState(80);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentTime = (progress / 100) * duration;

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;
      const rect = progressRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      setProgress(pct);
    },
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white flex items-center justify-center transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>

        <div className="flex-1 flex flex-col gap-1.5">
          <div
            ref={progressRef}
            className="w-full h-2 bg-warm-200 rounded-full cursor-pointer group relative"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-brand-500 rounded-full transition-all relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-warm-500">
            <span>{formatMinSec(currentTime)}</span>
            <span>{formatMinSec(duration)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded transition-colors",
                speed === s
                  ? "bg-brand-100 text-brand-700"
                  : "text-warm-500 hover:text-warm-700 hover:bg-warm-100"
              )}
            >
              {s}x
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-warm-500" />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 h-1 accent-brand-500"
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CallDetailClient({
  call,
  customer,
  linkedOrder,
  linkedReminders,
  shopConfig,
}: CallDetailClientProps) {
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  const callId = call.id as string;
  const direction = call.direction as string;
  const status = call.status as string;
  const startedAt = call.started_at as string;
  const durationSeconds = call.duration_seconds as number | null;
  const recordingUrl = call.recording_url as string | null;
  const transcript = call.transcript as string | null;
  const aiSummary = call.ai_summary as string | null;
  const sentiment = call.sentiment as string | null;
  const entitiesExtracted = call.entities_extracted as Record<string, unknown> | null;
  const followUpNeeded = call.follow_up_needed as boolean;

  const customerName =
    customer?.first_name || customer?.last_name
      ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
      : null;
  const customerPhone = (customer?.phone ?? call.customer_id) as string | null;
  const customerId = customer?.id as string | null;

  const transcriptLines = transcript ? parseTranscript(transcript) : [];
  const visibleLines = transcriptExpanded
    ? transcriptLines
    : transcriptLines.slice(0, TRANSCRIPT_PREVIEW_LINES);
  const hasMoreLines = transcriptLines.length > TRANSCRIPT_PREVIEW_LINES;

  /* ---- Entities ---- */
  const entities: { icon: typeof Package; label: string }[] = [];
  if (entitiesExtracted) {
    const products = entitiesExtracted.products as string[] | undefined;
    if (products?.length) {
      products.forEach((p) => entities.push({ icon: Package, label: p }));
    }

    const occasion = entitiesExtracted.occasion as string | undefined;
    if (occasion) entities.push({ icon: Gift, label: occasion });

    const deliveryDate = entitiesExtracted.delivery_date as string | undefined;
    if (deliveryDate)
      entities.push({
        icon: Calendar,
        label: `${shopConfig.service_labels.delivery}: ${deliveryDate}`,
      });

    const address = entitiesExtracted.address as string | undefined;
    if (address) entities.push({ icon: MapPin, label: address });

    const budget = entitiesExtracted.budget as string | number | undefined;
    if (budget != null) entities.push({ icon: DollarSign, label: `$${budget}` });

    const sentimentEntity = entitiesExtracted.sentiment as string | undefined;
    if (sentimentEntity) entities.push({ icon: Heart, label: sentimentEntity });

    const preferences = entitiesExtracted.preferences as string[] | undefined;
    if (preferences?.length) {
      preferences.forEach((p) => entities.push({ icon: Star, label: p }));
    }
  }

  /* ---- Order summary ---- */
  const orderSummary = linkedOrder
    ? (() => {
        const products = linkedOrder.products as unknown;
        let productLabel = "Items";
        if (Array.isArray(products)) {
          const names = products
            .map((p: Record<string, unknown>) => (p.name as string) || (p.product as string))
            .filter(Boolean);
          productLabel = names.length ? names.join(", ") : "Items";
        }
        const amount = linkedOrder.total_amount as number | null;
        const orderStatus = linkedOrder.status as string;
        return { productLabel, amount, status: orderStatus, id: linkedOrder.id as string };
      })()
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Back link ── */}
      <Link
        href="/dashboard/calls"
        className="inline-flex items-center gap-1.5 text-sm text-warm-600 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to calls
      </Link>

      {/* ── 1. Header ── */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              {customer ? (
                <Avatar
                  firstName={customer.first_name as string | null}
                  lastName={customer.last_name as string | null}
                  size="lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-warm-100 flex items-center justify-center text-warm-500">
                  <User size={20} />
                </div>
              )}

              <div className="min-w-0">
                <h1 className="text-2xl font-display text-warm-900 leading-tight">
                  Call with{" "}
                  {customerName ? (
                    <Link
                      href={`/dashboard/customers/${customerId}`}
                      className="text-brand-600 hover:text-brand-700 underline decoration-brand-200 hover:decoration-brand-400 transition-colors"
                    >
                      {customerName}
                    </Link>
                  ) : (
                    <span className="text-warm-700">
                      {customerPhone ? formatPhone(customerPhone) : "Unknown"}
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-sm text-warm-500">
                  <Clock size={14} />
                  <span>
                    {formatCallDate(startedAt)} · {formatCallTime(startedAt)}
                  </span>
                  {durationSeconds != null && (
                    <>
                      <span className="text-warm-300">·</span>
                      <span>{formatDuration(durationSeconds)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Badge variant={direction === "inbound" ? "info" : "neutral"}>
                {direction === "inbound" ? (
                  <PhoneIncoming size={12} className="mr-1" />
                ) : (
                  <PhoneOutgoing size={12} className="mr-1" />
                )}
                {direction === "inbound" ? "Inbound" : "Outbound"}
              </Badge>

              {STATUS_BADGE[status] && (
                <Badge variant={STATUS_BADGE[status].variant}>
                  {status === "missed" && <PhoneMissed size={12} className="mr-1" />}
                  {STATUS_BADGE[status].label}
                </Badge>
              )}

              {sentiment && SENTIMENT[sentiment] && (
                <Badge variant={SENTIMENT[sentiment].variant}>
                  {SENTIMENT[sentiment].emoji} {SENTIMENT[sentiment].label}
                </Badge>
              )}

              {followUpNeeded && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Follow-up needed
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── 2. Audio Player ── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-warm-900">Recording</h2>
        </CardHeader>
        <CardBody>
          {recordingUrl ? (
            <AudioPlayer duration={durationSeconds ?? 0} />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center mb-3">
                <Mic size={24} className="text-warm-400" />
              </div>
              <p className="text-sm font-medium text-warm-600">No recording available</p>
              <p className="text-xs text-warm-400 mt-1">
                Recording will appear here once call processing is complete
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── 3. AI Summary ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand-500" />
              <h2 className="text-lg font-semibold text-warm-900">AI Summary</h2>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-600">
              Generated by AI
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {aiSummary ? (
            <p className="text-sm text-warm-700 leading-relaxed whitespace-pre-wrap">
              {aiSummary}
            </p>
          ) : (
            <p className="text-sm text-warm-400 italic">
              No summary available — summary is generated after the call ends
            </p>
          )}
        </CardBody>
      </Card>

      {/* ── 4. Detected Entities ── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-warm-900">Detected Entities</h2>
        </CardHeader>
        <CardBody>
          {entities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {entities.map((ent, i) => (
                <EntityPill key={i} icon={ent.icon} label={ent.label} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-warm-400 italic">No entities detected yet</p>
          )}
        </CardBody>
      </Card>

      {/* ── 5. Transcript ── */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-warm-900">Transcript</h2>
        </CardHeader>
        <CardBody>
          {transcriptLines.length > 0 ? (
            <div className="space-y-3">
              {visibleLines.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg p-3",
                    line.isCustomer ? "bg-warm-50" : "bg-brand-50"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-bold mb-1",
                      line.isCustomer ? "text-warm-700" : "text-brand-700"
                    )}
                  >
                    {line.speaker}
                  </p>
                  <p className="text-sm text-warm-800 leading-relaxed">{line.text}</p>
                </div>
              ))}

              {hasMoreLines && (
                <button
                  onClick={() => setTranscriptExpanded(!transcriptExpanded)}
                  className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors mt-2"
                >
                  {transcriptExpanded ? (
                    <>
                      <ChevronUp size={16} />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      Show full transcript ({transcriptLines.length} lines)
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center mb-3">
                <FileText size={24} className="text-warm-400" />
              </div>
              <p className="text-sm text-warm-400">
                Transcript will appear here during live calls
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── 6. Linked Items ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LinkIcon size={18} className="text-warm-500" />
            <h2 className="text-lg font-semibold text-warm-900">Linked Items</h2>
          </div>
        </CardHeader>
        <CardBody>
          {!orderSummary && linkedReminders.length === 0 ? (
            <p className="text-sm text-warm-400 italic">No linked items for this call</p>
          ) : (
            <div className="space-y-4">
              {orderSummary && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-warm-200 bg-warm-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                      <Package size={18} className="text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-warm-800 truncate">
                        {shopConfig.service_labels.order}: {orderSummary.productLabel}
                        {orderSummary.amount != null && (
                          <span className="text-warm-500"> — ${orderSummary.amount}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      orderSummary.status === "delivered"
                        ? "success"
                        : orderSummary.status === "cancelled"
                          ? "danger"
                          : orderSummary.status === "confirmed"
                            ? "info"
                            : "warning"
                    }
                  >
                    {orderSummary.status}
                  </Badge>
                </div>
              )}

              {linkedReminders.map((r) => {
                const rid = r.id as string;
                const title = r.title as string;
                const reminderDate = r.reminder_date as string;
                const rStatus = r.status as string;
                return (
                  <div
                    key={rid}
                    className="flex items-center justify-between p-3 rounded-lg border border-warm-200 bg-warm-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-warning-100 flex items-center justify-center shrink-0">
                        <Calendar size={18} className="text-warning-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-warm-800 truncate">{title}</p>
                        <p className="text-xs text-warm-500">
                          {new Date(reminderDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        rStatus === "sent"
                          ? "success"
                          : rStatus === "dismissed"
                            ? "neutral"
                            : "warning"
                      }
                    >
                      {rStatus}
                    </Badge>
                  </div>
                );
              })}

              {customerId && (
                <Link
                  href={`/dashboard/customers/${customerId}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors mt-1"
                >
                  <User size={14} />
                  View customer profile
                </Link>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
