import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/jobs/dispatch-notifications/route";

vi.mock("@/server/modules/notifications/notifications.service", () => ({
  dispatchNotificationBatch: vi.fn(async () => ({
    claimed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    dead: 0,
    durationMs: 1,
  })),
}));

const TEST_SECRET = "integration-test-cron-secret-32";

describe("dispatch-notifications route", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", TEST_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 without secret header", async () => {
    const response = await POST(
      new Request("http://localhost/api/jobs/dispatch-notifications", { method: "POST" }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 401 with wrong secret", async () => {
    const response = await POST(
      new Request("http://localhost/api/jobs/dispatch-notifications", {
        method: "POST",
        headers: { "x-cron-secret": "wrong-secret-value-here-xx" },
      }),
    );
    expect(response.status).toBe(401);
  });

  it("returns 200 with valid secret", async () => {
    const response = await POST(
      new Request("http://localhost/api/jobs/dispatch-notifications", {
        method: "POST",
        headers: { "x-cron-secret": TEST_SECRET },
      }),
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as { claimed: number };
    expect(json.claimed).toBe(0);
  });
});
