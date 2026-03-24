"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NAV_ITEMS, NAV_BOTTOM } from "@/lib/utils/constants";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/formatting";

export interface SidebarProps {
  user?: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  shopName?: string;
}

export function Sidebar({ user, shopName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r border-warm-200 transition-all duration-300 z-30",
        "hidden lg:flex flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-warm-200">
        {!collapsed ? (
          <Link href="/" className="font-display text-xl font-semibold text-brand-500">
            CallContext
          </Link>
        ) : (
          <Link href="/" className="font-display text-xl font-bold text-brand-500">
            C
          </Link>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon =
            LucideIcons[item.icon as keyof typeof LucideIcons] as LucideIcons.LucideIcon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                "text-sm font-medium",
                isActive
                  ? "bg-brand-50 text-brand-700 border-l-3 border-brand-500"
                  : "text-warm-500 hover:bg-warm-100 hover:text-warm-700"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <div className="my-2 border-t border-warm-200" />

        {NAV_BOTTOM.map((item) => {
          const Icon =
            LucideIcons[item.icon as keyof typeof LucideIcons] as LucideIcons.LucideIcon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                "text-sm font-medium",
                isActive
                  ? "bg-brand-50 text-brand-700 border-l-3 border-brand-500"
                  : "text-warm-500 hover:bg-warm-100 hover:text-warm-700"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-warm-200">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-700 truncate">
                {user?.firstName || user?.email}
              </p>
              <p className="text-xs text-warm-500 truncate">{shopName || "Shop"}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar
              firstName={user?.firstName}
              lastName={user?.lastName}
              size="md"
            />
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-warm-200 rounded-full flex items-center justify-center text-warm-500 hover:text-warm-700 hover:border-warm-300 transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
