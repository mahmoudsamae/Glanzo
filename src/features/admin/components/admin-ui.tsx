import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AdminPageHeroProps = {
  kicker?: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
};

export function AdminPageHero({ kicker, title, subtitle, action }: AdminPageHeroProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
      <div className="max-w-2xl space-y-[var(--space-2)]">
        {kicker ? <p className="platform-admin-hero-kicker text-xs">{kicker}</p> : null}
        <h1 className="platform-admin-hero-title font-display text-2xl">{title}</h1>
        {subtitle ? <p className="text-sm leading-relaxed text-[var(--text-2)]">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AdminPrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="platform-admin-btn-primary">
      {children}
    </Link>
  );
}

type AdminPanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
  description?: string;
};

export function AdminPanel({ title, children, className, description }: AdminPanelProps) {
  return (
    <section className={cn("platform-admin-glass p-[var(--space-4)] sm:p-[var(--space-6)]", className)}>
      <div className="mb-[var(--space-4)] space-y-[var(--space-1)]">
        <h2 className="platform-admin-panel-title">{title}</h2>
        {description ? <p className="text-sm text-[var(--text-2)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function AdminEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border/80 px-[var(--space-4)] py-[var(--space-8)] text-center text-sm text-[var(--text-2)]">
      {children}
    </div>
  );
}

export function AdminAlertPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label="Alerts" className="platform-admin-alert p-[var(--space-4)] sm:p-[var(--space-5)]">
      <h2 className="mb-[var(--space-3)] text-sm font-medium text-[var(--brass)]">{title}</h2>
      <div className="text-sm text-[var(--text-1)]">{children}</div>
    </section>
  );
}

export function AdminFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="platform-admin-fact">
      <p className="text-xs uppercase tracking-wide text-[var(--text-2)]">{label}</p>
      <div className="mt-[var(--space-2)] text-sm text-[var(--text-0)]">{value}</div>
    </div>
  );
}
