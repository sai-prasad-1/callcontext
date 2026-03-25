"use client";

import { useState, useEffect } from "react";
import { ActivityItem } from "./ActivityItem";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

type Activity = {
  id: string;
  type: "call" | "note" | "order" | "reminder";
  timestamp: string;
  data: Record<string, unknown>;
  customer_id?: string;
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

interface ActivityFeedProps {
  initialActivities: Activity[];
  initialTotal: number;
  scope: "customer" | "shop";
  customerId?: string;
  shopConfig: ShopIndustryConfig;
}

export function ActivityFeed({
  initialActivities,
  initialTotal,
  scope,
  customerId,
  shopConfig,
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [total, setTotal] = useState(initialTotal);
  const [eventType, setEventType] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          scope,
          event_type: eventType,
          limit: "20",
          page: "1",
        });

        if (customerId) {
          params.set("customer_id", customerId);
        }

        const response = await fetch(`/api/activity?${params}`);
        const data = await response.json();

        setActivities(data.activities ?? []);
        setTotal(data.total ?? 0);
        setPage(1);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [eventType, scope, customerId]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        scope,
        event_type: eventType,
        limit: "20",
        page: String(page + 1),
      });

      if (customerId) {
        params.set("customer_id", customerId);
      }

      const response = await fetch(`/api/activity?${params}`);
      const data = await response.json();

      setActivities([...activities, ...(data.activities ?? [])]);
      setPage(page + 1);
    } catch (error) {
      console.error("Failed to load more activities:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const hasMore = activities.length < total;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {scope === "shop" ? "Activity Feed" : "Customer Activity"}
          </h1>
          <p className="text-warm-500">
            {total} {total === 1 ? "event" : "events"}
          </p>
        </div>

        <Select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          options={[
            { value: "all", label: "All Events" },
            { value: "call", label: "Calls" },
            { value: "note", label: "Notes" },
            { value: "order", label: `${shopConfig.service_labels.order}s` },
            { value: "reminder", label: "Reminders" },
          ]}
          placeholder="Filter by type"
          className="w-[180px]"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-warm-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-warm-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-warm-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-warm-500">
            <p className="text-lg font-medium">No activity yet</p>
            <p className="text-sm mt-1">
              Activity will appear here as you interact with customers
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-warm-200" />
            <div className="space-y-6">
              {activities.map((activity, index) => (
                <ActivityItem
                  key={`${activity.type}-${activity.id}`}
                  activity={activity}
                  shopConfig={shopConfig}
                  isLast={index === activities.length - 1}
                  scope={scope}
                />
              ))}
            </div>
          </div>

          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loadingMore}
                loading={loadingMore}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
