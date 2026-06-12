/**
 * Glanzo motion tokens — the ONLY home for animation durations and easings.
 *
 * LazyMotion contract:
 * - Wrap the app in `<MotionProvider>` (strict + domAnimation).
 * - Import animated components ONLY as `m` from `framer-motion/client` — never `motion`.
 * - ESLint blocks `motion` imports; strict LazyMotion throws at runtime if violated.
 *
 * Reduced motion:
 * - Call `useReducedMotion()` from `framer-motion` at the leaf that animates.
 * - Pass the flag into variant factories below; never branch at arbitrary call sites.
 */

import type { Transition, Variants } from "framer-motion";

/** Framer-ready durations in seconds. Keep in sync with `--t-*` in `src/styles/globals.css`. */
export const duration = {
  instant: 0.1,
  fast: 0.2,
  smooth: 0.3,
  /** Reserved for onboarding / signature moments only — never hot paths. */
  expressive: 0.6,
} as const;

/** Cubic-bezier tuples for Framer Motion. Keep in sync with `--ease-*` in globals.css. */
export const easing = {
  enter: [0.2, 0, 0, 1] as const,
  exit: [0.4, 0, 1, 1] as const,
} as const;

export const staggerChildren = 0.06;

export type ReducedMotion = boolean;

function transition(
  reducedMotion: ReducedMotion,
  seconds: (typeof duration)[keyof typeof duration],
  ease: (typeof easing)[keyof typeof easing],
): Transition {
  return {
    duration: seconds,
    ease: [...ease],
  };
}

/** Strip spatial offsets when the user prefers reduced motion. */
export function withReducedMotion<T extends Record<string, unknown>>(
  full: T,
  reduced: Partial<T>,
  reducedMotion: ReducedMotion,
): T {
  return reducedMotion ? ({ ...full, ...reduced } as T) : full;
}

export function fadeSlideIn(reducedMotion: ReducedMotion = false): Variants {
  return {
    hidden: withReducedMotion({ opacity: 0, y: 6 }, { opacity: 0, y: 0 }, reducedMotion),
    visible: {
      opacity: 1,
      y: 0,
      transition: transition(reducedMotion, duration.fast, easing.enter),
    },
  };
}

export function fadeOut(reducedMotion: ReducedMotion = false): Variants {
  return {
    visible: { opacity: 1 },
    hidden: {
      opacity: 0,
      transition: transition(reducedMotion, duration.fast, easing.exit),
    },
  };
}

export const pressScale = {
  whileTap: { scale: 0.98 },
  transition: {
    duration: duration.instant,
    ease: [...easing.enter],
  },
} as const;

/** Cinema layer tokens — mirror `--anim-*` in globals.css. Public mini-site only. */
export const cinema = {
  risePx: 24,
  cascadeStaggerMs: 60,
  kenBurnsDurationS: 20,
  sheenIntervalS: 6,
  bookBarPulseIntervalS: 8,
  heroTiltMaxDeg: 3,
  teamTiltMaxDeg: 6,
  confirmShimmerMs: 800,
} as const;

export function staggerContainer(reducedMotion: ReducedMotion = false): Variants {
  return {
    hidden: { opacity: reducedMotion ? 0 : 1 },
    visible: {
      opacity: 1,
      transition: reducedMotion
        ? transition(true, duration.fast, easing.enter)
        : {
            staggerChildren,
            delayChildren: 0,
          },
    },
  };
}
