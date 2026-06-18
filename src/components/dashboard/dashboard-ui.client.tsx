"use client";

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { li as MotionLi, ul as MotionUl } from "framer-motion/m";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeSlideIn, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function DashboardPrimaryButton({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Button type="button" className={cn("salon-dash-btn-primary", className)} {...props}>
      {children}
    </Button>
  );
}

export function DashboardSearch({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Input>) {
  return <Input className={cn("salon-dash-search", className)} {...props} />;
}

type DashboardRowCardProps = {
  href?: string;
  onClick?: () => void;
  avatar?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  badges?: ReactNode;
};

export function DashboardRowList({
  children,
  className,
  layout = "stack",
}: {
  children: ReactNode;
  className?: string;
  layout?: "stack" | "grid";
}) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionUl
      className={cn(
        layout === "grid"
          ? "grid gap-[var(--space-3)] sm:grid-cols-2 xl:grid-cols-3"
          : "flex flex-col gap-[var(--space-3)]",
        className,
      )}
      variants={staggerContainer(reducedMotion)}
      initial="hidden"
      animate="visible"
    >
      {children}
    </MotionUl>
  );
}

export function DashboardRowCard({
  href,
  onClick,
  avatar,
  title,
  subtitle,
  trailing,
  badges,
}: DashboardRowCardProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const body = (
    <>
      {avatar ? <div className="salon-dash-row-card__avatar">{avatar}</div> : null}
      <div className="min-w-0 flex-1 space-y-[var(--space-1)]">
        <div className="truncate font-medium text-[var(--text-0)]">{title}</div>
        {subtitle ? <div className="truncate text-sm text-[var(--text-2)]">{subtitle}</div> : null}
        {badges ? <div className="flex flex-wrap gap-[var(--space-2)] pt-[var(--space-1)]">{badges}</div> : null}
      </div>
      {trailing ? <div className="shrink-0 text-right">{trailing}</div> : null}
    </>
  );

  const className = "salon-dash-row-card group";

  const content = href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cn(className, "w-full text-left")}>
      {body}
    </button>
  );

  return (
    <MotionLi variants={fadeSlideIn(reducedMotion)} className="list-none">
      {content}
    </MotionLi>
  );
}

export function DashboardBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brass" | "ok" }) {
  return (
    <span className="salon-dash-badge" data-tone={tone}>
      {children}
    </span>
  );
}
