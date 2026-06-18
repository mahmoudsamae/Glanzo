"use client";

import { useReducedMotion } from "framer-motion";
import { div as MotionDiv, li as MotionLi, ul as MotionUl } from "framer-motion/m";
import type { ReactNode } from "react";

import { fadeSlideIn, staggerContainer, duration, easing } from "@/lib/motion";
import { cn } from "@/lib/utils";

import {
  describeAuditFacts,
  formatAuditAction,
  formatAuditEntity,
  formatAuditTime,
  getAuditTone,
} from "../lib/audit-labels";

type MetricItem = {
  label: string;
  value: number;
  accent?: "brass" | "ok" | "warn";
};

export function AdminMetricGrid({ metrics }: { metrics: MetricItem[] }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionDiv
      className="grid grid-cols-2 gap-[var(--space-3)] sm:grid-cols-4"
      variants={staggerContainer(reducedMotion)}
      initial="hidden"
      animate="visible"
      aria-label="Key metrics"
    >
      {metrics.map((metric) => (
        <MotionDiv
          key={metric.label}
          variants={fadeSlideIn(reducedMotion)}
          className="platform-admin-metric px-[var(--space-4)] py-[var(--space-4)]"
        >
          <p className="text-xs text-[var(--text-2)]">{metric.label}</p>
          <p className="platform-admin-metric__value mt-[var(--space-2)] text-3xl">{metric.value}</p>
          {metric.accent === "warn" && metric.value > 0 ? (
            <p className="mt-[var(--space-1)] text-xs text-[var(--signal-warn)]">Prüfen</p>
          ) : null}
        </MotionDiv>
      ))}
    </MotionDiv>
  );
}

export type AuditRow = {
  action?: unknown;
  entity?: unknown;
  created_at?: unknown;
  diff?: unknown;
};

export function AdminAuditTimeline({ rows, emptyMessage }: { rows: AuditRow[]; emptyMessage: string }) {
  const reducedMotion = useReducedMotion() ?? false;

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--text-2)]">{emptyMessage}</p>;
  }

  return (
    <MotionUl
      className="platform-admin-timeline"
      variants={staggerContainer(reducedMotion)}
      initial="hidden"
      animate="visible"
    >
      {rows.map((row, index) => {
        const action = String(row.action ?? "");
        const entity = formatAuditEntity(row.entity ? String(row.entity) : null);
        const tone = getAuditTone(action);
        const facts = describeAuditFacts(action, row.diff);
        const key = `${action}-${String(row.created_at ?? index)}`;

        return (
          <MotionLi
            key={key}
            variants={fadeSlideIn(reducedMotion)}
            className="platform-admin-timeline__item list-none"
          >
            <span className="platform-admin-timeline__dot" data-tone={tone} aria-hidden />
            <div className="flex flex-wrap items-start justify-between gap-[var(--space-2)]">
              <div className="min-w-0 space-y-[var(--space-2)]">
                <p className="font-medium text-[var(--text-0)]">{formatAuditAction(action)}</p>
                <p className="text-xs text-[var(--text-2)]">{entity ? entity : "Plattform"}</p>
                {facts.length > 0 ? (
                  <dl className="grid gap-[var(--space-2)] sm:grid-cols-2">
                    {facts.map((fact) => (
                      <div
                        key={`${fact.label}-${fact.value}`}
                        className="rounded-md border border-border/60 bg-[var(--ink-0)]/35 px-[var(--space-3)] py-[var(--space-2)]"
                      >
                        <dt className="text-[10px] uppercase tracking-wide text-[var(--text-2)]">
                          {fact.label}
                        </dt>
                        <dd className="mt-[var(--space-1)] text-sm text-[var(--text-0)]">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-xs text-[var(--text-2)]">Keine weiteren Details.</p>
                )}
              </div>
              <time className="shrink-0 text-xs tabular-nums text-[var(--text-2)]">
                {formatAuditTime(row.created_at ? String(row.created_at) : null)}
              </time>
            </div>
            {row.diff ? (
              <details className="mt-[var(--space-3)]">
                <summary className="cursor-pointer text-xs text-[var(--text-2)] hover:text-[var(--text-1)]">
                  Rohdaten (JSON)
                </summary>
                <pre className="mt-[var(--space-2)] max-h-48 overflow-auto rounded-md border border-border bg-[var(--ink-0)]/60 p-[var(--space-3)] text-xs text-[var(--text-2)]">
                  {JSON.stringify(row.diff, null, 2)}
                </pre>
              </details>
            ) : null}
          </MotionLi>
        );
      })}
    </MotionUl>
  );
}

type FilterOption = {
  value: string | null;
  label: string;
};

export function AdminFilterPills({
  options,
  value,
  onChange,
}: {
  options: readonly FilterOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-[var(--space-2)]">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          onClick={() => onChange(option.value)}
          className="platform-admin-filter-pill"
          data-active={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AdminTabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-[var(--space-1)] border-b border-border/80">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className="platform-admin-tab"
          data-active={active === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function AdminFadeIn({ children, className }: { children: ReactNode; className?: string }) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionDiv
      className={cn(className)}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: duration.smooth,
        ease: [...easing.enter],
      }}
    >
      {children}
    </MotionDiv>
  );
}

export function AdminTableShell({ children }: { children: ReactNode }) {
  return <div className="platform-admin-table-wrap platform-admin-glass">{children}</div>;
}
