import { describe, expect, it } from "vitest";

import { backoffMinutes, nextRetryAt, shouldMarkDead } from "@/lib/notifications/backoff";
import { computeFailureTransition } from "@/lib/notifications/outbox-transitions";

describe("notification backoff", () => {
  it("uses 2^attempts minutes", () => {
    expect(backoffMinutes(1)).toBe(2);
    expect(backoffMinutes(2)).toBe(4);
    expect(backoffMinutes(3)).toBe(8);
  });

  it("marks dead at 5+ attempts", () => {
    expect(shouldMarkDead(4)).toBe(false);
    expect(shouldMarkDead(5)).toBe(true);
  });

  it("failure transition schedules retry before dead threshold", () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const retry = computeFailureTransition(2, "provider_down", now);
    expect(retry.status).toBe("failed");
    expect(retry.scheduledFor!.getTime()).toBe(now.getTime() + 4 * 60_000);
  });

  it("failure transition becomes dead at attempt 5", () => {
    const dead = computeFailureTransition(5, "provider_down");
    expect(dead.status).toBe("dead");
  });

  it("nextRetryAt matches backoffMinutes", () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const next = nextRetryAt(3, now);
    expect(next.getTime() - now.getTime()).toBe(8 * 60_000);
  });
});
