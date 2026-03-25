"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Voicemail,
} from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/formatting";

const SENTIMENT_CONFIG = {
  positive: {
    label: "Positive",
    color: "text-success-700",
    bg: "bg-success-50",
    dot: "bg-success-500",
  },
  neutral: {
    label: "Neutral",
    color: "text-warning-700",
    bg: "bg-warning-50",
    dot: "bg-warning-500",
  },
  negative: {
    label: "Negative",
    color: "text-danger-700",
    bg: "bg-danger-50",
    dot: "bg-danger-500",
  },
} as const;

type SentimentKey = keyof typeof SENTIMENT_CONFIG;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "missed", label: "Missed" },
  { value: "voicemail", label: "Voicemail" },
] as const;

const DATE_PRESETS = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "duration_desc", label: "Longest" },
  { value: "duration_asc", label: "Shortest" },
] as const;

const LIMIT = 20;

function formatDuration(seconds: number | null): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatCallTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

function getDateFrom(preset: string): string | undefined {
  if (preset === "all") return undefined;
  const now = new Date();
  if (preset === "today") {
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }
  const days = parseInt(preset);
  now.setDate(now.getDate() - days);
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

interface CallListClientProps {
  initialCalls: any[];
  initialTotal: number;
}

export function CallListClient({
  initialCalls,
  initialTotal,
}: CallListClientProps) {
  const [calls, setCalls] = useState(initialCalls);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sort, setSort] = useState("newest");

  const isInitialMount = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(total / LIMIT);

  const fetchCalls = useCallback(
    async (params: {
      page: number;
      search: string;
      status: string;
      dateRange: string;
      sort: string;
    }) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        qs.set("page", String(params.page));
        qs.set("limit", String(LIMIT));
        if (params.search) qs.set("search", params.search);
        if (params.status !== "all") qs.set("status", params.status);
        const dateFrom = getDateFrom(params.dateRange);
        if (dateFrom) qs.set("date_from", dateFrom);
        qs.set("sort", params.sort);

        const res = await fetch(`/api/calls?${qs.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCalls(data.calls);
        setTotal(data.total);
      } catch {
        // keep current state on error
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchCalls({ page: 1, search, status, dateRange, sort });
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, status, dateRange, sort, fetchCalls]);

  useEffect(() => {
    if (isInitialMount.current) return;
    fetchCalls({ page, search, status, dateRange, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const rangeStart = (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(page * LIMIT, total);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-semibold text-warm-800">
          Calls
        </h1>
        <p className="text-warm-500 mt-1">
          View and manage all your customer calls.
        </p>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardBody className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 h-10 text-sm rounded-lg border border-warm-200 bg-white",
                "text-warm-700 placeholder:text-warm-400",
                "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                "transition-colors"
              )}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
                    status === opt.value
                      ? "bg-brand-50 text-brand-700 border-brand-200"
                      : "bg-white text-warm-600 border-warm-200 hover:bg-warm-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-warm-200 hidden sm:block" />

            {/* Date Range */}
            <div className="flex items-center gap-1">
              {DATE_PRESETS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDateRange(opt.value)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md border transition-colors",
                    dateRange === opt.value
                      ? "bg-brand-50 text-brand-700 border-brand-200"
                      : "bg-white text-warm-600 border-warm-200 hover:bg-warm-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-warm-200 hidden sm:block" />

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={cn(
                "h-9 px-3 pr-8 text-sm font-medium rounded-md border border-warm-200 bg-white",
                "text-warm-600 cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                "transition-colors appearance-none",
                "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23858078%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
                "bg-size-[16px] bg-position-[right_8px_center] bg-no-repeat"
              )}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Call List */}
      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : calls.length === 0 ? (
          <Card>
            <CardBody>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-warm-100 flex items-center justify-center mb-4">
                  <AlertCircle size={24} className="text-warm-400" />
                </div>
                <h3 className="text-lg font-semibold text-warm-700">
                  No calls yet
                </h3>
                <p className="text-sm text-warm-500 mt-1 max-w-sm">
                  Calls will appear here once customers start calling your
                  business number.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          calls.map((call: any) => <CallRow key={call.id} call={call} />)
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-500">
            Showing{" "}
            <span className="font-medium text-warm-700">{rangeStart}</span>
            {" – "}
            <span className="font-medium text-warm-700">{rangeEnd}</span>
            {" of "}
            <span className="font-medium text-warm-700">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CallRow({ call }: { call: any }) {
  const customer = call.customer;
  const isMissed = call.status === "missed";
  const isVoicemail = call.status === "voicemail";
  const sentiment: SentimentKey | null =
    call.sentiment && call.sentiment in SENTIMENT_CONFIG
      ? (call.sentiment as SentimentKey)
      : null;
  const sentimentCfg = sentiment ? SENTIMENT_CONFIG[sentiment] : null;

  const customerName =
    customer?.first_name || customer?.last_name
      ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
      : null;

  const DirectionIcon =
    call.direction === "outbound" ? PhoneOutgoing : PhoneIncoming;
  const directionIconColor =
    isMissed
      ? "text-danger-500"
      : call.direction === "outbound"
        ? "text-brand-500"
        : "text-warm-400";

  return (
    <Link href={`/dashboard/calls/${call.id}`} className="block group">
      <Card
        variant="hover"
        className={cn(
          "transition-all duration-150",
          isMissed && "bg-danger-50/30 border-danger-100"
        )}
      >
        <CardBody>
          <div className="flex items-center gap-4">
            {/* Left: Avatar + Name + Time */}
            <div className="flex items-center gap-3 min-w-0 w-48 shrink-0">
              <Avatar
                firstName={customer?.first_name}
                lastName={customer?.last_name}
                size="lg"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-warm-800 truncate">
                  {customerName ?? customer?.phone ?? "Unknown"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isMissed ? (
                    <PhoneMissed size={13} className="text-danger-500 shrink-0" />
                  ) : (
                    <DirectionIcon
                      size={13}
                      className={cn(directionIconColor, "shrink-0")}
                    />
                  )}
                  <span className="text-xs text-warm-500 truncate">
                    {call.started_at ? formatCallTime(call.started_at) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Summary */}
            <div className="flex-1 min-w-0 hidden md:block">
              {call.ai_summary ? (
                <p className="text-sm text-warm-600 truncate">
                  {call.ai_summary}
                </p>
              ) : (
                <p className="text-sm text-warm-400 italic">No summary</p>
              )}
            </div>

            {/* Right: Duration + Sentiment + Badges */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Duration */}
              <div className="flex items-center gap-1 text-sm text-warm-600">
                <Clock size={14} className="text-warm-400" />
                <span className="tabular-nums">
                  {formatDuration(call.duration_seconds)}
                </span>
              </div>

              {/* Sentiment */}
              {sentimentCfg && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                    sentimentCfg.bg,
                    sentimentCfg.color
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      sentimentCfg.dot
                    )}
                  />
                  {sentimentCfg.label}
                </div>
              )}

              {/* Status badges */}
              {isMissed && <Badge variant="danger">Missed</Badge>}
              {isVoicemail && (
                <Badge variant="warning">
                  <Voicemail size={12} className="mr-1" />
                  Voicemail
                </Badge>
              )}
              {call.follow_up_needed && (
                <Badge variant="info">Follow-up</Badge>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

function SkeletonRow() {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-4 animate-pulse">
          <div className="flex items-center gap-3 w-48 shrink-0">
            <div className="w-10 h-10 rounded-full bg-warm-200" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-warm-200 rounded w-28" />
              <div className="h-3 bg-warm-150 rounded w-20" />
            </div>
          </div>
          <div className="flex-1 hidden md:block">
            <div className="h-3.5 bg-warm-150 rounded w-3/4" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-3.5 bg-warm-150 rounded w-10" />
            <div className="h-6 bg-warm-150 rounded-full w-16" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
