"use client";

import { li as MotionLi } from "framer-motion/m";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { centsToEurDisplay } from "@/lib/money/price";
import { duration, easing } from "@/lib/motion";
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
  return (
    <ul className="mt-[var(--space-2)] divide-y divide-border border-y border-border">
      {services.map((service, index) => (
        <MotionLi
          key={service.id}
          layout
          transition={layoutTransition}
          className="group flex h-9 items-center gap-[var(--space-2)] bg-[var(--ink-0)] px-[var(--space-2)] text-sm"
          style={{ height: "36px" }}
        >
          <div className="flex shrink-0 flex-col">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-4 rounded-sm"
              disabled={index === 0}
              aria-label={`Move ${service.name} up`}
              onClick={() => onMove(index, -1)}
            >
              <ChevronUp className="size-3" strokeWidth={1.5} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-4 rounded-sm"
              disabled={index === services.length - 1}
              aria-label={`Move ${service.name} down`}
              onClick={() => onMove(index, 1)}
            >
              <ChevronDown className="size-3" strokeWidth={1.5} />
            </Button>
          </div>
          <span className="min-w-0 flex-1 truncate text-[var(--text-0)]">{service.name}</span>
          <span className="text-data text-[var(--text-2)]">{service.durationMin}m</span>
          <span className="text-data min-w-[4.5rem] text-right text-[var(--text-0)]">
            {centsToEurDisplay(service.priceCents)}
          </span>
          <span className="hidden w-10 text-center text-xs text-[var(--text-2)] sm:inline">
            {initialsFor(service, barbers)}
          </span>
          <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
            <button
              type="button"
              className="rounded p-1 text-[var(--text-2)] hover:text-[var(--text-0)]"
              aria-label={`Edit ${service.name}`}
              onClick={() => onEdit(service)}
            >
              <Pencil className="size-3.5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="rounded px-1 text-xs text-[var(--text-2)] hover:text-destructive"
              onClick={() => onArchive(service)}
            >
              Archive
            </button>
          </div>
        </MotionLi>
      ))}
    </ul>
  );
}
