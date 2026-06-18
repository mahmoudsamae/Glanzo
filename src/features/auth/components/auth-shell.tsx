import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { AuthBrandLine, AuthBrandMotion, AuthMotionShell } from "./auth-chrome.client";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthShell({ title, subtitle, children, footer, className }: AuthShellProps) {
  return (
    <div className={cn("salon-auth-shell flex min-h-full flex-1", className)}>
      <aside
        aria-hidden
        className="salon-auth-brand relative hidden overflow-hidden lg:flex lg:w-[min(44vw,520px)] lg:shrink-0 lg:flex-col lg:justify-between lg:p-[var(--space-12)]"
      >
        <AuthBrandMotion>
          <AuthBrandLine>
            <p className="salon-auth-kicker text-xs">Glanzo</p>
            <h2 className="salon-auth-brand-title mt-[var(--space-4)] font-display text-4xl leading-tight">
              Run your chair.
              <br />
              Own the day.
            </h2>
          </AuthBrandLine>
          <AuthBrandLine className="max-w-sm">
            <p className="text-base leading-relaxed text-[var(--text-2)]">
              Bookings, team, and your mini-site — one calm dashboard built for barbers who care about
              craft.
            </p>
          </AuthBrandLine>
        </AuthBrandMotion>
        <AuthBrandLine>
          <ul className="flex flex-col gap-[var(--space-3)] text-sm text-[var(--text-2)]">
            <li className="salon-auth-brand-pill">Live calendar & walk-ins</li>
            <li className="salon-auth-brand-pill">Customer ledger in seconds</li>
            <li className="salon-auth-brand-pill">Mini-site goes live on save</li>
          </ul>
        </AuthBrandLine>
      </aside>

      <AuthMotionShell className="salon-auth-main flex flex-1 flex-col justify-center px-[var(--space-4)] py-[var(--space-8)] lg:px-[var(--space-12)]">
        <div className="salon-auth-card mx-auto w-full max-w-[420px]">
          <header className="mb-[var(--space-8)] space-y-[var(--space-3)] text-center lg:text-left">
            <p className="salon-auth-kicker text-xs lg:hidden">Glanzo</p>
            <h1 className="salon-auth-title font-display text-3xl">{title}</h1>
            {subtitle ? <p className="text-base leading-relaxed text-[var(--text-2)]">{subtitle}</p> : null}
          </header>
          <div className="space-y-[var(--space-6)]">{children}</div>
          {footer ? (
            <footer className="mt-[var(--space-8)] text-center text-sm text-[var(--text-2)] lg:text-left">
              {footer}
            </footer>
          ) : null}
        </div>
      </AuthMotionShell>
    </div>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="salon-auth-link font-medium underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
