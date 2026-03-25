"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Pin,
  Trash2,
  Plus,
  X,
  Phone as PhoneIcon,
  Mail,
  Calendar,
  Star,
  MessageSquare,
  ShoppingBag,
  Bell,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { cn, formatPhone, formatDuration } from "@/lib/utils/formatting";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";
import type { Customer, Call, Order, Note, Reminder } from "@/lib/types/database";
import { CustomerLoyaltyCard } from "./CustomerLoyaltyCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CustomerPreferences = {
  primary: string[];
  secondary: string[];
  restrictions: string[];
  notes?: string;
};

type CustomerStats = {
  total_calls: number;
  total_orders: number;
  lifetime_value: number;
  days_since_last_contact: number | null;
};

type ActivityItem = {
  id: string;
  type: "call" | "note" | "order" | "reminder";
  timestamp: string;
  data: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(date: string | null): string {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
}

function formatDaysSince(days: number | null): string {
  if (days === null) return "Never";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getProductNames(products: unknown): string {
  if (!Array.isArray(products)) return "—";
  return (
    products
      .map((p: unknown) => {
        if (typeof p === "string") return p;
        if (p && typeof p === "object" && "name" in p)
          return String((p as { name: string }).name);
        return "";
      })
      .filter(Boolean)
      .join(", ") || "—"
  );
}

const TIER_CONFIG = {
  bronze: {
    label: "Bronze",
    next: "Silver",
    threshold: 500,
    badgeClass: "bg-warm-100 text-warm-700",
  },
  silver: {
    label: "Silver",
    next: "Gold",
    threshold: 1000,
    badgeClass: "bg-gray-100 text-gray-700",
  },
  gold: {
    label: "Gold",
    next: "Platinum",
    threshold: 2000,
    badgeClass: "bg-amber-100 text-amber-700",
  },
  platinum: {
    label: "Platinum",
    next: null as string | null,
    threshold: Infinity,
    badgeClass: "bg-purple-100 text-purple-700",
  },
} as const;

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-success-500",
  neutral: "bg-warning-500",
  negative: "bg-danger-500",
};

const ORDER_STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "danger" | "info"
> = {
  pending: "warning",
  confirmed: "info",
  delivered: "success",
  cancelled: "danger",
};

// ---------------------------------------------------------------------------
// Tag Input (used inside Preferences modal)
// ---------------------------------------------------------------------------

function TagInput({
  tags,
  onChange,
  suggestions,
  label,
  isDanger,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  label: string;
  isDanger?: boolean;
}) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = input.trim()
    ? suggestions.filter(
        (s) =>
          s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
      )
    : [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-warm-700 mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full",
              isDanger
                ? "bg-danger-50 text-danger-700"
                : "bg-brand-50 text-brand-700"
            )}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:opacity-70"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(input);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="w-full h-9 px-3 text-sm text-warm-700 bg-white border border-warm-200 rounded-md transition-all duration-150 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {showSuggestions && filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-warm-200 rounded-md shadow-lg max-h-40 overflow-auto">
            {filtered.slice(0, 8).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(suggestion)}
                className="w-full text-left px-3 py-1.5 text-sm text-warm-700 hover:bg-warm-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface CustomerProfileClientProps {
  customer: Customer;
  recentCalls: Call[];
  orders: Order[];
  notes: Note[];
  reminders: Reminder[];
  stats: CustomerStats;
  shopConfig: ShopIndustryConfig;
  shopSettings?: Record<string, unknown>;
  userId: string;
}

export function CustomerProfileClient({
  customer,
  recentCalls,
  orders,
  notes: initialNotes,
  reminders,
  stats,
  shopConfig,
  shopSettings,
}: CustomerProfileClientProps) {
  const router = useRouter();

  // --- State ---

  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Notes
  const [localNotes, setLocalNotes] = useState<Note[]>(initialNotes);
  const [noteContent, setNoteContent] = useState("");
  const [notePinned, setNotePinned] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Edit form
  const [editForm, setEditForm] = useState({
    first_name: customer.first_name || "",
    last_name: customer.last_name || "",
    email: customer.email || "",
    address: customer.address || "",
    city: customer.city || "",
    state: customer.state || "",
    zip: customer.zip || "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Preferences
  const preferences: CustomerPreferences = (customer.preferences as CustomerPreferences | null) ?? {
    primary: [],
    secondary: [],
    restrictions: [],
  };
  const [prefsForm, setPrefsForm] = useState({
    primary: [...(preferences.primary ?? [])],
    secondary: [...(preferences.secondary ?? [])],
    restrictions: [...(preferences.restrictions ?? [])],
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Activity
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [activitiesTotalPages, setActivitiesTotalPages] = useState(1);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // --- Derived ---

  const customerName =
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Unknown customer";

  const tier = TIER_CONFIG[customer.loyalty_tier] ?? TIER_CONFIG.bronze;
  const loyaltyProgress =
    tier.threshold === Infinity
      ? 100
      : Math.min(100, (customer.loyalty_points / tier.threshold) * 100);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "calls", label: "Calls" },
    { key: "orders", label: `${shopConfig.service_labels.order}s` },
    { key: "notes", label: "Notes" },
    { key: "activity", label: "Activity" },
  ];

  // --- Handlers ---

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setShowEditModal(false);
        router.refresh();
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefsForm }),
      });
      if (res.ok) {
        setShowPreferencesModal(false);
        router.refresh();
      }
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent, pinned: notePinned }),
      });
      if (res.ok) {
        const note: Note = await res.json();
        setLocalNotes((prev) => [note, ...prev]);
        setNoteContent("");
        setNotePinned(false);
        router.refresh();
      }
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    try {
      const res = await fetch(
        `/api/customers/${customer.id}/notes/${noteId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setLocalNotes((prev) => prev.filter((n) => n.id !== noteId));
        router.refresh();
      }
    } finally {
      setDeletingNoteId(null);
    }
  };

  const fetchActivities = useCallback(
    async (page: number) => {
      setLoadingActivities(true);
      try {
        const res = await fetch(
          `/api/activity?customer_id=${customer.id}&page=${page}&limit=20`
        );
        if (res.ok) {
          const data = await res.json();
          setActivities((prev) =>
            page === 1 ? data.activities : [...prev, ...data.activities]
          );
          setActivitiesPage(data.page);
          setActivitiesTotalPages(data.totalPages);
        }
      } finally {
        setLoadingActivities(false);
      }
    },
    [customer.id]
  );

  useEffect(() => {
    if (activeTab === "activity" && activities.length === 0) {
      fetchActivities(1);
    }
  }, [activeTab, activities.length, fetchActivities]);

  // --- Render ---

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Back link ─────────────────────────────────────────────────── */}
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to customers
      </Link>

      {/* ── Profile Header ────────────────────────────────────────────── */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-5">
            <Avatar
              firstName={customer.first_name}
              lastName={customer.last_name}
              size="xl"
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-display font-semibold text-warm-900">
                    {customerName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="inline-flex items-center gap-1 font-mono text-sm text-warm-600">
                      <PhoneIcon size={14} />
                      {formatPhone(customer.phone)}
                    </span>
                    {customer.email && (
                      <span className="inline-flex items-center gap-1 text-sm text-warm-500">
                        <Mail size={14} />
                        {customer.email}
                      </span>
                    )}
                  </div>

                  {customer.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {customer.tags.map((tag) => (
                        <Badge key={tag} variant="neutral">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit}
                  onClick={() => setShowEditModal(true)}
                >
                  Edit
                </Button>
              </div>

              {/* Loyalty */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full",
                    tier.badgeClass
                  )}
                >
                  <Star size={12} />
                  {tier.label}
                </span>
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center justify-between text-xs text-warm-500 mb-1">
                    <span>{customer.loyalty_points} pts</span>
                    {tier.next && (
                      <span>
                        {tier.threshold} for {tier.next}
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-300"
                      style={{ width: `${loyaltyProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Stats Bar ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Calls", value: String(stats.total_calls) },
          {
            label: `${shopConfig.service_labels.order}s`,
            value: String(stats.total_orders),
          },
          {
            label: "Lifetime value",
            value: formatCurrency(stats.lifetime_value),
          },
          {
            label: "Last seen",
            value: formatDaysSince(stats.days_since_last_contact),
          },
        ].map((stat) => (
          <Card key={stat.label} variant="stat">
            <CardBody className="text-center">
              <p className="text-2xl font-display font-semibold text-warm-900">
                {stat.value}
              </p>
              <p className="text-xs text-warm-500 mt-0.5">{stat.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────── */}
      <div className="border-b border-warm-200 overflow-x-auto">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2.5 text-sm whitespace-nowrap transition-colors",
                activeTab === tab.key
                  ? "border-b-2 border-brand-500 text-brand-700 font-medium"
                  : "text-warm-500 hover:text-warm-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab Content ───────────────────────────────────────────────── */}
      <div className="animate-fade-in">
        {/* ─── Overview ─────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Preferences */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-warm-800">
                      Preferences
                    </h3>
                    <button
                      onClick={() => setShowPreferencesModal(true)}
                      className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      Edit preferences
                    </button>
                  </div>
                </CardHeader>
                <CardBody className="space-y-4">
                  {/* Primary */}
                  <div>
                    <p className="text-xs font-medium text-warm-500 mb-1.5">
                      {shopConfig.preference_labels.primary}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(preferences.primary ?? []).length > 0 ? (
                        preferences.primary.map((item) => (
                          <span
                            key={item}
                            className="px-2 py-0.5 text-xs rounded-full bg-brand-50 text-brand-700"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-warm-400">None set</span>
                      )}
                    </div>
                  </div>

                  {/* Secondary */}
                  <div>
                    <p className="text-xs font-medium text-warm-500 mb-1.5">
                      {shopConfig.preference_labels.secondary}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(preferences.secondary ?? []).length > 0 ? (
                        preferences.secondary.map((item) => (
                          <span
                            key={item}
                            className="px-2 py-0.5 text-xs rounded-full bg-warm-100 text-warm-700"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-warm-400">None set</span>
                      )}
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div>
                    <p className="text-xs font-medium text-warm-500 mb-1.5">
                      {shopConfig.preference_labels.restrictions}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(preferences.restrictions ?? []).length > 0 ? (
                        preferences.restrictions.map((item) => (
                          <span
                            key={item}
                            className="px-2 py-0.5 text-xs rounded-full bg-danger-50 text-danger-700"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-warm-400">None set</span>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Reminders */}
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-semibold text-warm-800">
                    Upcoming Reminders
                  </h3>
                </CardHeader>
                <CardBody>
                  {reminders.length > 0 ? (
                    <div className="space-y-3">
                      {reminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className="flex items-start gap-3"
                        >
                          <div className="mt-0.5 p-1.5 bg-brand-50 rounded-md">
                            <Bell size={14} className="text-brand-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-warm-800 truncate">
                              {reminder.title}
                            </p>
                            <p className="text-xs text-warm-500">
                              {new Date(
                                reminder.reminder_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          {reminder.recurring && (
                            <Badge variant="info">Recurring</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-warm-400 text-center py-4">
                      No upcoming reminders
                    </p>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Loyalty Program */}
            {shopSettings && (
              <CustomerLoyaltyCard
                customerId={customer.id}
                currentTier={customer.loyalty_tier}
                currentPoints={customer.loyalty_points}
                shopConfig={{ loyalty: (shopSettings.loyalty as any) ?? { enabled: false } }}
              />
            )}
          </div>
        )}

        {/* ─── Calls ────────────────────────────────────────────────── */}
        {activeTab === "calls" && (
          <Card>
            <CardBody>
              {recentCalls.length > 0 ? (
                <div className="divide-y divide-warm-100">
                  {recentCalls.map((call) => (
                    <Link
                      key={call.id}
                      href={`/dashboard/calls/${call.id}`}
                      className="flex items-center gap-4 py-3 hover:bg-warm-50 -mx-5 px-5 transition-colors group"
                    >
                      <div className="shrink-0 text-sm text-warm-600 w-28">
                        {new Date(call.started_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" }
                        )}
                        <span className="text-warm-400 ml-1">
                          {new Date(call.started_at).toLocaleTimeString(
                            undefined,
                            { hour: "numeric", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                      <div className="shrink-0 text-sm font-mono text-warm-500 w-12">
                        {call.duration_seconds
                          ? formatDuration(call.duration_seconds)
                          : "—"}
                      </div>
                      {call.sentiment && (
                        <div
                          className={cn(
                            "shrink-0 w-2.5 h-2.5 rounded-full",
                            SENTIMENT_COLORS[call.sentiment]
                          )}
                          title={call.sentiment}
                        />
                      )}
                      <p className="flex-1 text-sm text-warm-600 line-clamp-2 min-w-0">
                        {call.ai_summary || "No summary available"}
                      </p>
                      {call.follow_up_needed && (
                        <Badge variant="warning">Follow-up</Badge>
                      )}
                      <ChevronRight
                        size={16}
                        className="shrink-0 text-warm-300 group-hover:text-warm-500 transition-colors"
                      />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <PhoneIcon
                    size={32}
                    className="mx-auto text-warm-300 mb-2"
                  />
                  <p className="text-sm text-warm-500">No calls yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* ─── Orders (dynamic label) ──────────────────────────────── */}
        {activeTab === "orders" && (
          <Card>
            <CardBody>
              {orders.length > 0 ? (
                <div className="divide-y divide-warm-100">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3"
                    >
                      <div className="shrink-0 text-sm text-warm-600 w-24">
                        {new Date(order.created_at).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" }
                        )}
                      </div>
                      <p className="flex-1 text-sm text-warm-700 truncate min-w-0">
                        {getProductNames(order.products)}
                      </p>
                      {order.delivery_date && (
                        <span className="shrink-0 inline-flex items-center gap-1 text-xs text-warm-500">
                          <Calendar size={12} />
                          {new Date(
                            order.delivery_date
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                      <span className="shrink-0 text-sm font-medium text-warm-800 w-20 text-right">
                        {order.total_amount != null
                          ? formatCurrency(order.total_amount)
                          : "—"}
                      </span>
                      <Badge
                        variant={
                          ORDER_STATUS_VARIANT[order.status] ?? "neutral"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <ShoppingBag
                    size={32}
                    className="mx-auto text-warm-300 mb-2"
                  />
                  <p className="text-sm text-warm-500">
                    No {shopConfig.service_labels.order.toLowerCase()}s yet
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* ─── Notes ────────────────────────────────────────────────── */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            {/* Add note form */}
            <Card>
              <CardBody>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm text-warm-700 bg-white border border-warm-200 rounded-md placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <label className="inline-flex items-center gap-2 text-sm text-warm-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notePinned}
                      onChange={(e) => setNotePinned(e.target.checked)}
                      className="rounded border-warm-300 text-brand-500 focus:ring-brand-500"
                    />
                    <Pin size={14} />
                    Pin note
                  </label>
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    loading={savingNote}
                    disabled={!noteContent.trim()}
                    icon={Plus}
                  >
                    Add note
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Notes list */}
            {localNotes.length > 0 ? (
              <div className="space-y-2">
                {localNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={cn(
                      note.pinned && "border-l-2 border-l-brand-500"
                    )}
                  >
                    <CardBody className="group">
                      <div className="flex items-start gap-2">
                        {note.pinned && (
                          <Pin
                            size={14}
                            className="shrink-0 mt-0.5 text-brand-500"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-warm-700 whitespace-pre-wrap">
                            {note.content}
                          </p>
                          <p className="text-xs text-warm-400 mt-1.5">
                            {relativeTime(note.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          disabled={deletingNoteId === note.id}
                          className="shrink-0 opacity-0 group-hover:opacity-100 p-1 text-warm-400 hover:text-danger-500 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardBody className="text-center py-10">
                  <MessageSquare
                    size={32}
                    className="mx-auto text-warm-300 mb-2"
                  />
                  <p className="text-sm text-warm-500">No notes yet</p>
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* ─── Activity ─────────────────────────────────────────────── */}
        {activeTab === "activity" && (
          <Card>
            <CardBody>
              {loadingActivities && activities.length === 0 ? (
                <div className="text-center py-10">
                  <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-warm-500 mt-2">
                    Loading activity...
                  </p>
                </div>
              ) : activities.length > 0 ? (
                <div>
                  {activities.map((activity) => {
                    const iconMap = {
                      call: PhoneIcon,
                      note: MessageSquare,
                      order: ShoppingBag,
                      reminder: Bell,
                    };
                    const colorMap = {
                      call: "bg-brand-50 text-brand-600",
                      note: "bg-warm-100 text-warm-600",
                      order: "bg-accent-50 text-accent-600",
                      reminder: "bg-info-50 text-info-700",
                    };
                    const Icon = iconMap[activity.type];

                    let description = "";
                    if (activity.type === "call") {
                      const dur = activity.data
                        .duration_seconds as number | null;
                      const summary = activity.data
                        .ai_summary as string | null;
                      description = `Call${dur ? ` — ${formatDuration(dur)}` : ""}${summary ? `: ${summary}` : ""}`;
                    } else if (activity.type === "note") {
                      const content = activity.data.content as string;
                      description = `Note added: ${content}`;
                    } else if (activity.type === "order") {
                      const products = activity.data.products;
                      const amount = activity.data
                        .total_amount as number | null;
                      description = `${shopConfig.service_labels.order} created: ${getProductNames(products)}${amount != null ? `, ${formatCurrency(amount)}` : ""}`;
                    } else if (activity.type === "reminder") {
                      description = `Reminder: ${activity.data.title as string}`;
                    }

                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 py-3 border-b border-warm-100 last:border-0"
                      >
                        <div
                          className={cn(
                            "shrink-0 p-1.5 rounded-md mt-0.5",
                            colorMap[activity.type]
                          )}
                        >
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-warm-700 line-clamp-2">
                            {description}
                          </p>
                          <p className="text-xs text-warm-400 mt-0.5">
                            {relativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {activitiesPage < activitiesTotalPages && (
                    <div className="pt-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={loadingActivities}
                        onClick={() => fetchActivities(activitiesPage + 1)}
                      >
                        Load more
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Clock
                    size={32}
                    className="mx-auto text-warm-300 mb-2"
                  />
                  <p className="text-sm text-warm-500">No activity yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      {/* ── Edit Modal ────────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-warm-900/40 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <Card className="relative w-full max-w-md animate-fade-in-up z-10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold text-warm-900">
                  Edit Customer
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 text-warm-400 hover:text-warm-600"
                >
                  <X size={18} />
                </button>
              </div>
            </CardHeader>
            <CardBody className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      first_name: e.target.value,
                    }))
                  }
                />
                <Input
                  label="Last name"
                  value={editForm.last_name}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      last_name: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-warm-700 mb-1">
                  Phone
                </label>
                <p className="h-9 flex items-center px-3 text-sm text-warm-500 bg-warm-50 border border-warm-200 rounded-md font-mono">
                  {formatPhone(customer.phone)}
                </p>
              </div>

              <Input
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
              />
              <Input
                label="Address"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, address: e.target.value }))
                }
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={editForm.city}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
                <Input
                  label="State"
                  value={editForm.state}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, state: e.target.value }))
                  }
                />
                <Input
                  label="Zip"
                  value={editForm.zip}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, zip: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  loading={savingEdit}
                >
                  Save changes
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ── Preferences Edit Modal ────────────────────────────────────── */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-warm-900/40 backdrop-blur-sm"
            onClick={() => setShowPreferencesModal(false)}
          />
          <Card className="relative w-full max-w-md animate-fade-in-up z-10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-display font-semibold text-warm-900">
                  Edit Preferences
                </h2>
                <button
                  onClick={() => setShowPreferencesModal(false)}
                  className="p-1 text-warm-400 hover:text-warm-600"
                >
                  <X size={18} />
                </button>
              </div>
            </CardHeader>
            <CardBody className="space-y-5 max-h-[70vh] overflow-y-auto">
              <TagInput
                tags={prefsForm.primary}
                onChange={(tags) =>
                  setPrefsForm((f) => ({ ...f, primary: tags }))
                }
                suggestions={shopConfig.product_vocabulary.items}
                label={shopConfig.preference_labels.primary}
              />
              <TagInput
                tags={prefsForm.secondary}
                onChange={(tags) =>
                  setPrefsForm((f) => ({ ...f, secondary: tags }))
                }
                suggestions={shopConfig.product_vocabulary.items}
                label={shopConfig.preference_labels.secondary}
              />
              <TagInput
                tags={prefsForm.restrictions}
                onChange={(tags) =>
                  setPrefsForm((f) => ({ ...f, restrictions: tags }))
                }
                suggestions={shopConfig.product_vocabulary.items}
                label={shopConfig.preference_labels.restrictions}
                isDanger
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPreferencesModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePreferences}
                  loading={savingPreferences}
                >
                  Save preferences
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
