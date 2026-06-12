"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/d/settings/shop", label: "Shop" },
  { href: "/d/settings/notifications", label: "Benachrichtigungen" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-[var(--space-8)] flex gap-[var(--space-2)] border-b border-[var(--ink-3)]">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-[var(--space-3)] py-[var(--space-2)] text-sm transition-colors ${
              active
                ? "border-[var(--brass)] text-[var(--text-0)]"
                : "border-transparent text-[var(--text-2)] hover:text-[var(--text-0)]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
