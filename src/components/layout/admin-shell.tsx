import type { ReactNode } from "react";

import { AdminShellNav } from "@/components/layout/admin-shell-nav.client";
import { SignOutForm } from "@/components/shared/sign-out-form";

export type AdminShellProps = {
  adminEmail: string;
  signOutAction: () => Promise<void>;
  children: ReactNode;
};

export function AdminShell({ adminEmail, signOutAction, children }: AdminShellProps) {
  return (
    <div className="platform-admin-root flex min-h-full flex-1 flex-col">
      <div className="platform-admin-shell flex min-h-full flex-1 flex-col">
        <header className="platform-admin-header">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-[var(--space-4)] px-[var(--space-4)] py-[var(--space-3)]">
            <div className="flex min-w-0 items-center gap-[var(--space-4)]">
              <div className="flex min-w-0 items-baseline gap-[var(--space-2)]">
                <span className="platform-admin-hero-title truncate font-display text-lg">Glanzo</span>
                <span className="shrink-0 rounded-full border border-[color-mix(in_oklch,var(--brass)_25%,var(--ink-3))] bg-[color-mix(in_oklch,var(--brass)_8%,var(--ink-1))] px-[var(--space-2)] py-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--brass)]">
                  Platform
                </span>
              </div>
              <AdminShellNav className="hidden sm:flex" />
            </div>
            <div className="flex shrink-0 items-center gap-[var(--space-3)] text-sm text-[var(--text-2)]">
              <span
                className="hidden max-w-[14rem] truncate rounded-full border border-border/70 bg-[var(--ink-0)]/40 px-[var(--space-3)] py-1 md:inline"
                title={adminEmail}
              >
                {adminEmail}
              </span>
              <SignOutForm signOutAction={signOutAction} />
            </div>
          </div>
          <AdminShellNav className="flex border-t border-border/60 px-[var(--space-4)] py-[var(--space-2)] sm:hidden" />
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-[var(--space-4)] py-[var(--space-6)] sm:py-[var(--space-8)]">
          {children}
        </div>
      </div>
    </div>
  );
}
