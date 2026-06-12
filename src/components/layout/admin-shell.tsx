import Link from "next/link";
import type { ReactNode } from "react";

import { SignOutForm } from "@/components/shared/sign-out-form";
import { cn } from "@/lib/utils";

export type AdminShellProps = {
  adminEmail: string;
  signOutAction: () => Promise<void>;
  children: ReactNode;
};

const NAV = [
  { href: "/admin", label: "Übersicht", exact: true },
  { href: "/admin/shops", label: "Shops", exact: false },
] as const;

export function AdminShell({ adminEmail, signOutAction, children }: AdminShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--ink-0)]">
      <header className="border-b border-border bg-[var(--ink-1)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-3)]">
          <div className="flex min-w-0 items-center gap-[var(--space-4)]">
            <div className="flex min-w-0 items-baseline gap-[var(--space-2)]">
              <span className="truncate font-display text-lg text-[var(--text-0)]">Glanzo</span>
              <span className="shrink-0 rounded border border-border px-[var(--space-2)] py-0.5 text-xs uppercase tracking-wide text-[var(--text-2)]">
                Platform
              </span>
            </div>
            <nav aria-label="Platform" className="hidden items-center gap-[var(--space-1)] sm:flex">
              {NAV.map((item) => (
                <AdminNavLink key={item.href} href={item.href} exact={item.exact}>
                  {item.label}
                </AdminNavLink>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-[var(--space-3)] text-sm text-[var(--text-2)]">
            <span className="hidden max-w-[14rem] truncate md:inline" title={adminEmail}>
              {adminEmail}
            </span>
            <SignOutForm signOutAction={signOutAction} />
          </div>
        </div>
        <nav
          aria-label="Platform mobile"
          className="flex gap-[var(--space-1)] border-t border-border px-[var(--space-4)] py-[var(--space-2)] sm:hidden"
        >
          {NAV.map((item) => (
            <AdminNavLink key={item.href} href={item.href} exact={item.exact}>
              {item.label}
            </AdminNavLink>
          ))}
        </nav>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-[var(--space-4)] py-[var(--space-6)]">{children}</div>
    </div>
  );
}

function AdminNavLink({
  href,
  exact,
  children,
}: {
  href: string;
  exact: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-[var(--space-3)] py-[var(--space-2)] text-sm text-[var(--text-2)] transition-colors hover:bg-[var(--ink-2)] hover:text-[var(--text-1)]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-1)]",
      )}
      data-admin-nav={exact ? "exact" : "prefix"}
    >
      {children}
    </Link>
  );
}
