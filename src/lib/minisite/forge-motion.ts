import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type ForgeRevealVariant = "up" | "left" | "right" | "fade" | "scale";

export function forgeReveal(
  variant: ForgeRevealVariant = "up",
  delayMs = 0,
  className?: string,
) {
  return {
    className: cn(className, `ms-forge-reveal ms-forge-reveal--${variant}`),
    style: (delayMs ? { ["--forge-delay" as string]: `${delayMs}ms` } : undefined) as
      | CSSProperties
      | undefined,
  };
}

export function forgeHeroEnter(delayMs = 0, className?: string) {
  return {
    className: cn(className, "ms-forge-hero-enter"),
    style: (delayMs ? { ["--forge-delay" as string]: `${delayMs}ms` } : undefined) as
      | CSSProperties
      | undefined,
  };
}
