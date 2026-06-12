import { expect, test } from "@playwright/test";

const SHOP_SLUG = "demo-barber-a";
const SERVICE_ID = "f0000000-0000-4000-8000-000000000001";

function uniquePhone() {
  return `+49176${Math.floor(Math.random() * 9_000_000 + 1_000_000)}`;
}

test.describe("Phase 3 public booking API", () => {
  test("availability → book → get → reschedule → cancel", async ({ request }) => {
    const bookDate = "2027-04-12";

    const availability = await request.get(
      `/api/public/shops/${SHOP_SLUG}/availability?serviceId=${SERVICE_ID}&date=${bookDate}`,
    );
    expect(availability.status()).toBe(200);
    const availabilityBody = await availability.json();
    expect(availabilityBody.data?.slots?.length).toBeGreaterThan(0);

    const slot = availabilityBody.data.slots[0];
    const idempotencyKey = crypto.randomUUID();

    const booking = await request.post(`/api/public/shops/${SHOP_SLUG}/bookings`, {
      headers: { "Idempotency-Key": idempotencyKey },
      data: {
        serviceId: SERVICE_ID,
        membershipId: slot.membershipId,
        startsAt: slot.startsAt,
        name: "API E2E Guest",
        phone: uniquePhone(),
        email: "phase3-e2e@glanzo.test",
      },
    });
    expect(booking.status()).toBe(201);
    const bookingBody = await booking.json();
    expect(bookingBody.data?.manageUrl).toMatch(/^\/bookings\//);

    const manageToken = bookingBody.data.manageUrl.replace("/bookings/", "");
    const view = await request.get(`/api/public/bookings/${manageToken}`);
    expect(view.status()).toBe(200);
    expect(view.headers()["cache-control"]).toContain("no-store");

    const altSlot = availabilityBody.data.slots.find(
      (candidate: { startsAt: string }) => candidate.startsAt !== slot.startsAt,
    );
    expect(altSlot).toBeTruthy();

    const rescheduled = await request.post(`/api/public/bookings/${manageToken}/reschedule`, {
      data: { startsAt: altSlot.startsAt },
    });
    expect(rescheduled.status()).toBe(200);
    const rescheduledBody = await rescheduled.json();
    const newToken = rescheduledBody.data.manageUrl.replace("/bookings/", "");
    expect(newToken).not.toBe(manageToken);

    const stale = await request.get(`/api/public/bookings/${manageToken}`);
    expect(stale.status()).toBe(404);

    const cancelled = await request.post(`/api/public/bookings/${newToken}/cancel`);
    expect(cancelled.status()).toBe(200);
    const cancelledBody = await cancelled.json();
    expect(cancelledBody.data?.status).toBe("cancelled");
  });

  test("rejects booking without Idempotency-Key header", async ({ request }) => {
    const response = await request.post(`/api/public/shops/${SHOP_SLUG}/bookings`, {
      data: {
        serviceId: SERVICE_ID,
        startsAt: "2027-05-01T07:00:00.000Z",
        name: "No Key Guest",
        phone: uniquePhone(),
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error?.code).toBe("INVALID_INPUT");
  });
});
