"use client";

import { useReducedMotion } from "framer-motion";
import { li as MotionLi, ul as MotionUl } from "framer-motion/m";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { centsToEurDisplay } from "@/lib/money/price";
import { duration, easing, fadeSlideIn, staggerContainer } from "@/lib/motion";
import type { BarberOption, ServiceCatalogItem } from "@/lib/services/catalog";

const layoutTransition = {
  duration: duration.fast,
  ease: [...easing.enter] as [number, number, number, number],
};

type ServicesLedgerListProps = {
  services: ServiceCatalogItem[];
  barbers: BarberOption[];
  onMove: (index: number, direction: -1 | 1) => void;
  onEdit: (service: ServiceCatalogItem) => void;
  onArchive: (service: ServiceCatalogItem) => void;
};

function initialsFor(service: ServiceCatalogItem, barbers: BarberOption[]): string {
  const matches = barbers.filter((b) => service.assignedMembershipIds.includes(b.membershipId));
  if (matches.length === 0) return "—";
  return matches.map((b) => b.initials).join(" ");
}

export function ServicesLedgerList({
  services,
  barbers,
  onMove,
  onEdit,
  onArchive,
}: ServicesLedgerListProps) {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <MotionUl
      className="flex flex-col gap-[var(--space-3)]"
      variants={staggerContainer(reducedMotion)}
      initial="hidden"
      animate="visible"
    >
      {services.map((service, index) => (
        <MotionLi
          key={service.id}
          layout
          variants={fadeSlideIn(reducedMotion)}
          transition={layoutTransition}
          className="salon-dash-service-row group list-none"
        >
          <div className="flex shrink-0 flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 rounded-md"
              disabled={index === 0}
              aria-label={`Move ${service.name} up`}
              onClick={() => onMove(index, -1)}
            >
              <ChevronUp className="size-3.5" strokeWidth={1.5} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 rounded-md"
              disabled={index === services.length - 1}
              aria-label={`Move ${service.name} down`}
              onClick={() => onMove(index, 1)}
            >
              <ChevronDown className="size-3.5" strokeWidth={1.5} />
            </Button>
          </div>

          <div className="min-w-0">
            <p className="truncate font-medium text-[var(--text-0)]">{service.name}</p>
            <p className="mt-[var(--space-1)] text-sm text-[var(--text-2)]">
              {service.durationMin} min · {initialsFor(service, barbers)}
            </p>
          </div>

          <span className="salon-dash-service-price text-data">
            {service.showPrice ? centsToEurDisplay(service.priceCents) : "—"}
          </span>

          <div className="flex items-center gap-[var(--space-1)] opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-md border border-border/70 text-[var(--text-2)] hover:border-[color-mix(in_oklch,var(--brass)_30%,var(--ink-3))] hover:text-[var(--text-0)]"
              aria-label={`Edit ${service.name}`}
              onClick={() => onEdit(service)}
            >
              <Pencil className="size-3.5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="rounded-md px-[var(--space-2)] py-[var(--space-1)] text-xs text-[var(--text-2)] hover:text-[var(--signal-bad)]"
              onClick={() => onArchive(service)}
            >
              Archive
            </button>
          </div>
        </MotionLi>
      ))}
    </MotionUl>
  );
}
