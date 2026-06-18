import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardPageProps = {
  children: ReactNode;
  width?: "md" | "lg" | "xl" | "full";
  className?: string;
};

const WIDTH: Record<NonNullable<DashboardPageProps["width"]>, string> = {
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-none",
};

export function DashboardPage({ children, width = "lg", className }: DashboardPageProps) {
  return (
    <div
      className={cn(
        "salon-dash-page mx-auto w-full flex-1 px-[var(--space-4)] py-[var(--space-6)] sm:px-[var(--space-6)] sm:py-[var(--space-8)] lg:px-[var(--space-8)]",
        WIDTH[width],
        className,
      )}
    >
      {children}
    </div>
  );
}

type DashboardPageHeaderProps = {
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function DashboardPageHeader({ kicker, title, subtitle, action }: DashboardPageHeaderProps) {
  return (
    <header className="salon-dash-page-header mb-[var(--space-6)]">
      <div className="flex flex-wrap items-end justify-between gap-[var(--space-4)]">
        <div className="space-y-[var(--space-2)]">
          {kicker ? <p className="salon-dash-kicker text-xs">{kicker}</p> : null}
          <h1 className="salon-dash-page-title font-display text-3xl sm:text-4xl">{title}</h1>
          {subtitle ? <p className="max-w-xl text-base leading-relaxed text-[var(--text-2)]">{subtitle}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <span className="salon-dash-page-header__line" aria-hidden />
    </header>
  );
}

type DashboardPanelProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const PANEL_PADDING = {
  sm: "p-[var(--space-4)]",
  md: "p-[var(--space-5)] sm:p-[var(--space-6)]",
  lg: "p-[var(--space-6)] sm:p-[var(--space-8)]",
};

export function DashboardPanel({
  title,
  description,
  children,
  className,
  padding = "md",
}: DashboardPanelProps) {
  return (
    <section className={cn("salon-dash-panel", PANEL_PADDING[padding], className)}>
      {title ? (
        <div className="mb-[var(--space-4)] space-y-[var(--space-1)]">
          <h2 className="salon-dash-panel-title">{title}</h2>
          {description ? <p className="text-sm text-[var(--text-2)]">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function DashboardStatChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="salon-dash-stat-chip">
      <p className="text-[10px] uppercase tracking-wide text-[var(--text-2)]">{label}</p>
      <p className="mt-[var(--space-1)] text-sm font-medium text-[var(--text-0)]">{value}</p>
    </div>
  );
}

export function DashboardMetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="salon-dash-metric-tile">
      <p className="salon-dash-kicker text-[10px]">{label}</p>
      <p className="salon-dash-metric-tile__value mt-[var(--space-2)] font-display text-2xl leading-none">{value}</p>
      {hint ? <p className="mt-[var(--space-2)] text-xs text-[var(--text-2)]">{hint}</p> : null}
    </div>
  );
}
