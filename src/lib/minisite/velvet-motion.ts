import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type VelvetRevealVariant = "up" | "left" | "right" | "fade" | "scale";

export function velvetReveal(
  variant: VelvetRevealVariant = "up",
  delayMs = 0,
  className?: string,
) {
  return {
    className: cn(className, `ms-velvet-reveal ms-velvet-reveal--${variant}`),
    style: (delayMs ? { ["--velvet-delay" as string]: `${delayMs}ms` } : undefined) as
      | CSSProperties
      | undefined,
  };
}

export function velvetHeroEnter(delayMs = 0, className?: string) {
  return {
    className: cn(className, "ms-velvet-hero-enter"),
    style: (delayMs ? { ["--velvet-delay" as string]: `${delayMs}ms` } : undefined) as
      | CSSProperties
      | undefined,
  };
}
