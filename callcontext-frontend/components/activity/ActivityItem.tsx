"use client";

import { formatDistanceToNow } from "date-fns";
import { Phone, FileText, Package, Bell, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/formatting";
import type { ShopIndustryConfig } from "@/lib/types/shop-config";

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

interface ActivityItemProps {
  activity: Activity;
  shopConfig: ShopIndustryConfig;
  isLast?: boolean;
  scope?: "customer" | "shop";
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function ActivityItem({
  activity,
  shopConfig,
  isLast = false,
  scope = "customer",
}: ActivityItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case "call":
        return <Phone className="h-5 w-5" />;
      case "note":
        return <FileText className="h-5 w-5" />;
      case "order":
        return <Package className="h-5 w-5" />;
      case "reminder":
        return <Bell className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getIconColor = () => {
    switch (activity.type) {
      case "call":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "note":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
      case "order":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "reminder":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300";
    }
  };

  const getDescription = () => {
    switch (activity.type) {
      case "call": {
        const direction = activity.data.direction as string;
        const status = activity.data.status as string;
        return `${direction === "inbound" ? "Incoming" : "Outgoing"} call ${
          status === "completed" ? "completed" : status
        }`;
      }
      case "note":
        return activity.data.pinned ? "Note pinned" : "Note added";
      case "order": {
        const status = activity.data.status as string;
        return `${shopConfig.service_labels.order} ${status || "created"}`;
      }
      case "reminder":
        return "Reminder created";
      default:
        return "Activity";
    }
  };

  const getSecondaryInfo = () => {
    switch (activity.type) {
      case "call": {
        const duration = activity.data.duration_seconds as number;
        const summary = activity.data.ai_summary as string | null;
        return (
          <div className="space-y-1">
            {duration > 0 && (
              <p className="text-sm text-warm-500">
                Duration: {formatDuration(duration)}
              </p>
            )}
            {summary && (
              <p className="text-sm text-warm-500 line-clamp-2">
                {summary}
              </p>
            )}
          </div>
        );
      }
      case "note": {
        const content = activity.data.content as string;
        return (
          <p className="text-sm text-warm-500 line-clamp-2">
            {content}
          </p>
        );
      }
      case "order": {
        const amount = activity.data.total_amount as number;
        const products = activity.data.products as any;
        return (
          <div className="space-y-1">
            {amount > 0 && (
              <p className="text-sm font-medium">{formatCurrency(amount)}</p>
            )}
            {products && Array.isArray(products) && products.length > 0 && (
              <p className="text-sm text-warm-500">
                {products.length} {products.length === 1 ? "item" : "items"}
              </p>
            )}
          </div>
        );
      }
      case "reminder": {
        const title = activity.data.title as string;
        const reminderDate = activity.data.reminder_date as string;
        return (
          <div className="space-y-1">
            <p className="text-sm text-warm-500">{title}</p>
            {reminderDate && (
              <p className="text-xs text-warm-400">
                Due: {new Date(reminderDate).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const getLink = () => {
    switch (activity.type) {
      case "call":
        return `/dashboard/calls/${activity.id}`;
      case "order":
        return `/dashboard/orders/${activity.id}`;
      case "note":
      case "reminder":
        if (activity.customer_id) {
          return `/dashboard/customers/${activity.customer_id}`;
        }
        return null;
      default:
        return null;
    }
  };

  const link = getLink();
  const content = (
    <div
      className={cn(
        "relative flex gap-4 group",
        link && "cursor-pointer hover:bg-warm-50 -mx-4 px-4 py-2 rounded-lg transition-colors"
      )}
    >
      <div className={cn("relative z-10 flex h-10 w-10 items-center justify-center rounded-full", getIconColor())}>
        {getIcon()}
      </div>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{getDescription()}</p>
            {scope === "shop" && activity.customer && (
              <Link
                href={`/dashboard/customers/${activity.customer.id}`}
                className="text-sm text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {activity.customer.first_name} {activity.customer.last_name}
              </Link>
            )}
          </div>
          <time className="text-xs text-warm-400 whitespace-nowrap">
            {formatDistanceToNow(new Date(activity.timestamp), {
              addSuffix: true,
            })}
          </time>
        </div>
        {getSecondaryInfo()}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}
