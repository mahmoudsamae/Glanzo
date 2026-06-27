import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type MeccaRevealVariant = "up" | "left" | "right" | "fade";

export function meccaReveal(
  variant: MeccaRevealVariant = "up",
  delayMs = 0,
  className?: string,
) {
  return {
    className: cn(className, `ms-mecca-reveal ms-mecca-reveal--${variant}`),
    style: (delayMs ? { ["--mecca-delay" as string]: `${delayMs}ms` } : undefined) as
      | CSSProperties
      | undefined,
  };
}

export function meccaHeroEnter(delayMs = 0, className?: string) {
  return {
    className: cn(className, "ms-mecca-hero-enter"),
    style: (delayMs ? { ["--mecca-delay" as string]: `${delayMs}ms` } : undefined) as
      | CSSProperties
      | undefined,
  };
}
