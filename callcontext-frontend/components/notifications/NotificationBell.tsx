"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { NotificationDropdown } from "./NotificationDropdown";

interface NotificationBellProps {
  userId: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useSWR("/api/notifications?limit=1", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const unreadCount = data?.unread_count ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-warm-500 hover:text-warm-700 hover:bg-warm-100 rounded-md transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-5 h-5 bg-danger-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        userId={userId}
        open={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
