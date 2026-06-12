import { describe, expect, it } from "vitest";

import { duration } from "@/lib/motion";

/**
 * Motion/CSS token discipline — durations in lib/motion.ts must match globals.css --t-*.
 */
describe("motion token discipline", () => {
  const cssMs = {
    instant: 100,
    fast: 200,
    smooth: 300,
    expressive: 600,
  } as const;

  for (const [key, ms] of Object.entries(cssMs)) {
    it(`duration.${key} matches --t-${key} (${ms}ms)`, () => {
      const seconds = duration[key as keyof typeof duration];
      expect(Math.round(seconds * 1000)).toBe(ms);
    });
  }
});
