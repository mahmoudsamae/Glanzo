"use client";

import { useEffect, useState } from "react";

type MetricNumberProps = {
  value: number;
  format?: (value: number) => string;
  className?: string;
  /** When false, render the value directly (admin cockpit — no count-up). */
  animate?: boolean;
};

function AnimatedMetricNumber({
  value,
  format = (n) => String(n),
  className,
}: Required<Pick<MetricNumberProps, "value">> &
  Pick<MetricNumberProps, "format" | "className">) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const delta = value - start;
    if (delta === 0) {
      return;
    }
    const durationMs = 400;
    const startTime = performance.now();

    let frame = 0;
    const step = (time: number) => {
      const progress = Math.min(1, (time - startTime) / durationMs);
      setDisplay(Math.round(start + delta * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from last rendered display
  }, [value]);

  return <span className={className}>{format(display)}</span>;
}

export function MetricNumber({
  value,
  format = (n) => String(n),
  className,
  animate = true,
}: MetricNumberProps) {
  if (!animate) {
    return <span className={className}>{format(value)}</span>;
  }

  return <AnimatedMetricNumber value={value} format={format} className={className} />;
}
