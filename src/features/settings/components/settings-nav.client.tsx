"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/d/settings/shop", label: "Shop" },
  { href: "/d/settings/website", label: "Website" },
  { href: "/d/settings/notifications", label: "Benachrichtigungen" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="salon-dash-settings-tabs mb-[var(--space-6)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn("salon-dash-settings-tab", active && "salon-dash-settings-tab--active")}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
