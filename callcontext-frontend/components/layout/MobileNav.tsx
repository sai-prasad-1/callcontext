"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { NAV_ITEMS } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/formatting";

export function MobileNav() {
  const pathname = usePathname();

  // Show only first 4 nav items on mobile
  const mobileItems = NAV_ITEMS.slice(0, 4);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-warm-200 z-30">
      <div className="flex items-center justify-around h-full px-2">
        {mobileItems.map((item) => {
          const Icon =
            LucideIcons[item.icon as keyof typeof LucideIcons] as LucideIcons.LucideIcon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-md transition-colors flex-1",
                isActive
                  ? "text-brand-600"
                  : "text-warm-500"
              )}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
