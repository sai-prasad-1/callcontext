"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/formatting";

const links = [
  { href: "/dashboard/settings", label: "Overview", always: true },
  { href: "/dashboard/settings/billing", label: "Billing", key: "billing" as const },
  { href: "/dashboard/settings/team", label: "Team", key: "team" as const },
];

type SettingsSubnavProps = {
  showBilling: boolean;
  showTeam: boolean;
};

export function SettingsSubnav({ showBilling, showTeam }: SettingsSubnavProps) {
  const pathname = usePathname();

  const visible = links.filter((l) => {
    if (l.always) return true;
    if (l.key === "billing") return showBilling;
    if (l.key === "team") return showTeam;
    return false;
  });

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-warm-200 pb-4">
      {visible.map((l) => {
        const active =
          l.href === "/dashboard/settings"
            ? pathname === "/dashboard/settings"
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-700"
                : "text-warm-600 hover:bg-warm-100 hover:text-warm-800"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
