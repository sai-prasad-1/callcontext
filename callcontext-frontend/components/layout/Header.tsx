"use client";

import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/formatting";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export interface HeaderProps {
  title?: string;
  user?: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  userId?: string;
}

export function Header({ title, user, userId }: HeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <header className="h-14 bg-white border-b border-warm-200 flex items-center justify-between px-6">
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-warm-800">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {userId && <NotificationBell userId={userId} />}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 hover:bg-warm-100 rounded-md transition-colors cursor-pointer"
          >
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="sm"
            />
            <ChevronDown size={16} className="text-warm-500" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-warm-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-warm-150">
                <p className="text-sm font-medium text-warm-700">
                  {user?.firstName || user?.email}
                </p>
                <p className="text-xs text-warm-500">{user?.email}</p>
              </div>

              <Link
                href="/dashboard/settings/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-warm-700 hover:bg-warm-50 transition-colors cursor-pointer"
                onClick={() => setShowDropdown(false)}
              >
                <User size={16} />
                Profile
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-warm-700 hover:bg-warm-50 transition-colors cursor-pointer"
                onClick={() => setShowDropdown(false)}
              >
                <Settings size={16} />
                Settings
              </Link>

              <div className="border-t border-warm-150 my-2" />

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut size={16} />
                {loggingOut ? "Signing out…" : "Log out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
