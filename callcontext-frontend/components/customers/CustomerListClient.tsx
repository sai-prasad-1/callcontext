"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Users,
} from "lucide-react";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";
import type { Customer } from "@/lib/types/database";
import { formatPhone } from "@/lib/utils/formatting";
import { cn } from "@/lib/utils/formatting";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { AddCustomerModal } from "@/components/customers/AddCustomerModal";

const LIMIT = 20;

const COMMON_TAGS = [
  "VIP",
  "Regular",
  "New",
  "Corporate",
  "Event Planner",
  "Recurring",
  "Holiday Client",
  "Premium",
  "Referral",
  "Walk-in",
  "Wedding Client",
  "Sympathy",
  "Valentine's Day",
  "Mother's Day",
];

const SORT_OPTIONS = [
  { value: "last_contact", label: "Last contact" },
  { value: "name", label: "Name A–Z" },
  { value: "lifetime_value", label: "Lifetime value" },
  { value: "total_orders", label: "Total orders" },
];

const LOYALTY_STYLES: Record<string, string> = {
  bronze: "bg-warm-100 text-warm-700",
  silver: "bg-gray-100 text-gray-700",
  gold: "bg-amber-100 text-amber-700",
  platinum: "bg-purple-100 text-purple-700",
};

function relativeTime(date: string | null): string {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const currencyFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface Props {
  initialCustomers: Customer[];
  initialTotal: number;
  shopConfig: ShopIndustryConfig;
}

export function CustomerListClient({
  initialCustomers,
  initialTotal,
}: Props) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState("last_contact");
  const [loading, setLoading] = useState(false);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const tagRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const totalPages = Math.ceil(total / LIMIT);
  const rangeStart = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(page * LIMIT, total);

  const fetchCustomers = useCallback(
    async (p: number, s: string, tags: string[], sortBy: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(LIMIT),
          sort: sortBy,
        });
        if (s) params.set("search", s);
        if (tags.length > 0) params.set("tag", tags.join(","));

        const res = await fetch(`/api/customers?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCustomers(data.customers);
        setTotal(data.total);
      } catch {
        // keep existing data on error
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      setPage(1);
      fetchCustomers(1, search, selectedTags, sort);
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Immediate fetch on tag/sort/page changes
  useEffect(() => {
    if (isInitialMount.current) return;
    fetchCustomers(page, search, selectedTags, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedTags, sort]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setShowTagFilter(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1);
  }

  function handleCreated() {
    fetchCustomers(1, search, selectedTags, sort);
    setPage(1);
  }

  function customerDisplayName(c: Customer) {
    if (c.first_name || c.last_name) {
      return [c.first_name, c.last_name].filter(Boolean).join(" ");
    }
    return formatPhone(c.phone);
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-warm-900">
          Customers
        </h1>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setAddModalOpen(true)}
        >
          Add customer
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* Tag filter */}
        <div ref={tagRef} className="relative">
          <Button
            variant="secondary"
            icon={Filter}
            onClick={() => {
              setShowTagFilter((v) => !v);
              setShowSortMenu(false);
            }}
          >
            Tags
            {selectedTags.length > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-brand-500 text-white">
                {selectedTags.length}
              </span>
            )}
          </Button>

          {showTagFilter && (
            <div className="absolute right-0 sm:left-0 mt-2 w-64 bg-white border border-warm-200 rounded-lg shadow-lg z-30 animate-fade-in">
              <div className="p-3 border-b border-warm-150">
                <p className="text-xs font-medium text-warm-500 uppercase tracking-wide">
                  Filter by tag
                </p>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto space-y-0.5">
                {COMMON_TAGS.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-warm-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      className="h-4 w-4 rounded border-warm-300 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm text-warm-700">{tag}</span>
                  </label>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="p-2 border-t border-warm-150">
                  <button
                    onClick={() => {
                      setSelectedTags([]);
                      setPage(1);
                    }}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} className="relative">
          <Button
            variant="secondary"
            icon={ArrowUpDown}
            onClick={() => {
              setShowSortMenu((v) => !v);
              setShowTagFilter(false);
            }}
          >
            {SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort"}
          </Button>

          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-warm-200 rounded-lg shadow-lg z-30 animate-fade-in">
              <div className="p-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setPage(1);
                      setShowSortMenu(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                      sort === opt.value
                        ? "bg-brand-50 text-brand-700 font-medium"
                        : "text-warm-700 hover:bg-warm-50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-warm-200 rounded-lg p-4 flex items-center gap-4"
            >
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="hidden sm:flex gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <div className="hidden md:block space-y-1 text-right">
                <Skeleton className="h-3 w-16 ml-auto" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customers will appear here once they call your shop or you add them manually."
          action={
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setAddModalOpen(true)}
            >
              Add your first customer
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/customers/${c.id}`}
              className="block group"
            >
              <div className="bg-white border border-warm-200 rounded-lg p-4 flex items-center gap-4 transition-all duration-150 hover:shadow-md hover:border-warm-300 group-focus-visible:ring-2 group-focus-visible:ring-brand-500 group-focus-visible:ring-offset-2">
                {/* Avatar + name */}
                <Avatar
                  firstName={c.first_name}
                  lastName={c.last_name}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-900 truncate">
                    {customerDisplayName(c)}
                  </p>
                  <p className="text-xs font-mono text-warm-500 mt-0.5">
                    {formatPhone(c.phone)}
                  </p>
                </div>

                {/* Tags */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  {c.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="neutral">
                      {tag}
                    </Badge>
                  ))}
                  {c.tags.length > 2 && (
                    <span className="text-xs text-warm-500">
                      +{c.tags.length - 2} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 shrink-0 text-right">
                  <div>
                    <p className="text-xs text-warm-500">Last contact</p>
                    <p className="text-sm font-medium text-warm-800">
                      {relativeTime(c.last_contact_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-warm-500">Lifetime</p>
                    <p className="text-sm font-medium text-warm-800">
                      {currencyFmt.format(c.lifetime_value)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full capitalize",
                      LOYALTY_STYLES[c.loyalty_tier] ?? LOYALTY_STYLES.bronze
                    )}
                  >
                    {c.loyalty_tier}
                  </span>
                </div>

                {/* Mobile loyalty badge */}
                <span
                  className={cn(
                    "md:hidden inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full capitalize shrink-0",
                    LOYALTY_STYLES[c.loyalty_tier] ?? LOYALTY_STYLES.bronze
                  )}
                >
                  {c.loyalty_tier}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-warm-600">
            Showing{" "}
            <span className="font-medium text-warm-800">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of <span className="font-medium text-warm-800">{total}</span>
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

      {/* Add customer modal */}
      <AddCustomerModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
