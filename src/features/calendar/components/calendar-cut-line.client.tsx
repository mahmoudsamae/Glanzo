"use client";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type CalendarCutLineProps = {
  topPx: number;
};

/** Live Cut Line — brass hairline + notch crossing all barber columns. */
export function CalendarCutLine({ topPx }: CalendarCutLineProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20"
      style={{
        top: topPx,
        transition: reducedMotion ? undefined : "top 0.4s linear",
      }}
      aria-hidden
    >
      <div className="relative h-px w-full bg-[var(--brass)]">
        <div
          className="absolute top-1/2 left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[var(--brass)] bg-[var(--ink-0)]"
          aria-hidden
        />
      </div>
    </div>
  );
}
