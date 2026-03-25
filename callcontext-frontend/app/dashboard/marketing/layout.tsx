"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Send } from "lucide-react";
import { cn } from "@/lib/utils/formatting";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Segments",
      href: "/dashboard/marketing",
      icon: Users,
      isActive: pathname === "/dashboard/marketing" || pathname.startsWith("/dashboard/marketing/segments"),
    },
    {
      label: "Campaigns",
      href: "/dashboard/marketing/campaigns",
      icon: Send,
      isActive: pathname.startsWith("/dashboard/marketing/campaigns"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-warm-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors",
                  tab.isActive
                    ? "border-brand-500 text-brand-600"
                    : "border-transparent text-warm-600 hover:text-warm-900 hover:border-warm-300"
                )}
              >
                <Icon size={18} />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
