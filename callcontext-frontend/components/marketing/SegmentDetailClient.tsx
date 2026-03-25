"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentBuilder } from "@/components/marketing/SegmentBuilder";
import { formatPhone, cn } from "@/lib/utils/formatting";
import type { Customer } from "@/lib/types/database";

const LIMIT = 20;

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

type Segment = {
  id: string;
  name: string;
  description: string | null;
  filter: Record<string, any>;
  is_preset: boolean;
  created_at: string;
  updated_at: string;
};

interface Props {
  segment: Segment;
  initialCustomers: Customer[];
  initialTotal: number;
}

export function SegmentDetailClient({
  segment: initialSegment,
  initialCustomers,
  initialTotal,
}: Props) {
  const router = useRouter();
  const [segment, setSegment] = useState(initialSegment);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / LIMIT);
  const rangeStart = total === 0 ? 0 : (page - 1) * LIMIT + 1;
  const rangeEnd = Math.min(page * LIMIT, total);

  const fetchCustomers = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          limit: String(LIMIT),
        });

        const res = await fetch(`/api/segments/${segment.id}?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCustomers(data.customers);
        setTotal(data.total);
        setSegment(data.segment);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setLoading(false);
      }
    },
    [segment.id]
  );

  useEffect(() => {
    if (page !== 1) {
      fetchCustomers(page);
    }
  }, [page, fetchCustomers]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this segment?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/segments/${segment.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete segment");
        return;
      }
      router.push("/dashboard/marketing");
    } catch (error) {
      alert("Failed to delete segment");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSegmentSaved() {
    setBuilderOpen(false);
    setPage(1);
    await fetchCustomers(1);
  }

  function customerDisplayName(c: Customer) {
    if (c.first_name || c.last_name) {
      return [c.first_name, c.last_name].filter(Boolean).join(" ");
    }
    return formatPhone(c.phone);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/marketing">
          <Button variant="secondary" icon={ArrowLeft} size="sm">
            Back
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-display font-semibold text-warm-900">
              {segment.name}
            </h1>
            <Badge variant="primary">
              <Users size={14} className="mr-1" />
              {total}
            </Badge>
          </div>
          {segment.description && (
            <p className="text-sm text-warm-600">{segment.description}</p>
          )}
        </div>

        {!segment.is_preset && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Edit}
              onClick={() => setBuilderOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              icon={Trash2}
              onClick={handleDelete}
              disabled={deleting}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

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
          title="No customers match"
          description="No customers currently match the criteria for this segment."
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

      {!segment.is_preset && (
        <SegmentBuilder
          open={builderOpen}
          onClose={() => setBuilderOpen(false)}
          onSave={handleSegmentSaved}
          existingSegment={segment as any}
        />
      )}
    </div>
  );
}
