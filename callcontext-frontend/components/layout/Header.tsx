"use client";

import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/formatting";

export interface HeaderProps {
  title?: string;
  user?: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  notificationCount?: number;
  onLogout?: () => void;
}

export function Header({
  title,
  user,
  notificationCount = 0,
  onLogout,
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
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

  return (
    <header className="h-14 bg-white border-b border-warm-200 flex items-center justify-between px-6">
      {/* Title */}
      <div>
        {title && (
          <h1 className="text-lg font-semibold text-warm-800">{title}</h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 text-warm-500 hover:text-warm-700 hover:bg-warm-100 rounded-md transition-colors"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
          )}
        </Link>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 hover:bg-warm-100 rounded-md transition-colors"
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
                href="/settings/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <User size={16} />
                Profile
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-3 px-4 py-2 text-sm text-warm-700 hover:bg-warm-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <Settings size={16} />
                Settings
              </Link>

              <div className="border-t border-warm-150 my-2" />

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onLogout?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
