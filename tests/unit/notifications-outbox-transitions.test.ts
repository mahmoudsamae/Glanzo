import { describe, expect, it } from "vitest";

import {
  computeFailureTransition,
  sentTransition,
  skippedTransition,
} from "@/lib/notifications/outbox-transitions";

describe("outbox state machine transitions", () => {
  const cases = [
    { from: "pending", event: "sent", status: "sent" },
    { from: "pending", event: "skipped", status: "skipped" },
    { from: "pending", event: "failed_retry", status: "failed" },
    { from: "pending", event: "failed_dead", status: "dead" },
  ] as const;

  it.each(cases)("$from → $status on $event", ({ event, status }) => {
    if (event === "sent") {
      expect(sentTransition().status).toBe(status);
    } else if (event === "skipped") {
      expect(skippedTransition("reason").status).toBe(status);
    } else if (event === "failed_retry") {
      expect(computeFailureTransition(2, "err").status).toBe(status);
    } else {
      expect(computeFailureTransition(5, "err").status).toBe(status);
    }
  });
});
