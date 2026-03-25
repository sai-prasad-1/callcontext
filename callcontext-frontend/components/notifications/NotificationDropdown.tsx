"use client";

import {
  Bell,
  Phone,
  Package,
  CheckSquare,
  AlertCircle,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import useSWR from "swr";
import { formatRelativeDate, cn } from "@/lib/utils/formatting";

interface NotificationDropdownProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: "reminder" | "order" | "task" | "call" | "system";
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const typeIcons = {
  reminder: Bell,
  order: Package,
  task: CheckSquare,
  call: Phone,
  system: Settings,
};

const typeColors = {
  reminder: "text-primary-600",
  order: "text-success-600",
  task: "text-info-600",
  call: "text-warning-600",
  system: "text-warm-600",
};

export function NotificationDropdown({
  userId,
  open,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, mutate, isLoading } = useSWR(
    open ? "/api/notifications?limit=10" : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await fetch(`/api/notifications/${notification.id}/read`, {
        method: "PATCH",
      });
      mutate();
    }

    if (notification.link) {
      router.push(notification.link);
    }

    onClose();
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/mark-all-read", {
      method: "POST",
    });
    mutate();
  };

  if (!open) return null;

  const notifications = (data?.notifications as Notification[]) ?? [];
  const unreadCount = data?.unread_count ?? 0;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-[360px] max-h-[480px] bg-white rounded-lg shadow-lg border border-warm-200 overflow-hidden z-50"
    >
      <div className="sticky top-0 bg-white border-b border-warm-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-warm-800">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-warm-500">{unreadCount} unread</p>
          )}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[360px]">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-3 bg-warm-50 rounded-md animate-pulse"
              >
                <div className="h-4 bg-warm-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-warm-200 rounded w-full" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto text-warm-400 mb-2" />
            <p className="text-sm text-warm-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-warm-100">
            {notifications.map((notification) => {
              const Icon = typeIcons[notification.type];
              const colorClass = typeColors[notification.type];

              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full text-left p-3 hover:bg-warm-50 transition-colors flex gap-3",
                    !notification.read && "bg-primary-50/30"
                  )}
                >
                  <div className={cn("flex-shrink-0 mt-0.5", colorClass)}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-warm-800 line-clamp-1">
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <span className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-1.5" />
                      )}
                    </div>

                    {notification.body && (
                      <p className="text-xs text-warm-600 line-clamp-2 mb-1">
                        {notification.body}
                      </p>
                    )}

                    <p className="text-xs text-warm-500">
                      {formatRelativeDate(notification.created_at)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-white border-t border-warm-200 px-3 py-2 flex items-center justify-between">
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Mark all read
          </button>
        )}
        <button
          onClick={() => {
            router.push("/dashboard/notifications");
            onClose();
          }}
          className="text-xs text-warm-600 hover:text-warm-700 font-medium ml-auto"
        >
          View all
        </button>
      </div>
    </div>
  );
}
