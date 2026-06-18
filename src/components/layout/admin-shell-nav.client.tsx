"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Übersicht", exact: true },
  { href: "/admin/shops", label: "Shops", exact: false },
] as const;

export function AdminShellNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Platform" className={cn("flex items-center gap-[var(--space-1)]", className)}>
      {NAV.map((item) => (
        <AdminNavLink key={item.href} href={item.href} exact={item.exact} pathname={pathname}>
          {item.label}
        </AdminNavLink>
      ))}
    </nav>
  );
}

function AdminNavLink({
  href,
  exact,
  pathname,
  children,
}: {
  href: string;
  exact: boolean;
  pathname: string;
  children: ReactNode;
}) {
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "platform-admin-nav-link focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-1)]",
      )}
    >
      {children}
    </Link>
  );
}
