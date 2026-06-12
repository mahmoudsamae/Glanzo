"use client";

import { useState, useTransition } from "react";

import type { PublicApiEnvelope } from "@/lib/api/public-response";

type DevBookingPanelProps = {
  shopSlug: string;
  serviceId: string;
  membershipId: string;
};

type LogLine = string;

export function DevBookingPanel({ shopSlug, serviceId, membershipId }: DevBookingPanelProps) {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isPending, startTransition] = useTransition();

  function log(line: string) {
    setLogs((current) => [...current, line]);
  }

  function runFlow() {
    startTransition(async () => {
      setLogs([]);
      const bookDate = "2027-08-18";

      log(`GET /api/public/shops/${shopSlug}/availability …`);
      const availabilityResponse = await fetch(
        `/api/public/shops/${shopSlug}/availability?serviceId=${serviceId}&date=${bookDate}&membershipId=${membershipId}`,
      );
      const availabilityBody = (await availabilityResponse.json()) as PublicApiEnvelope<{
        slots: Array<{ startsAt: string; membershipId: string }>;
      }>;
      if ("error" in availabilityBody) {
        log(`availability error: ${availabilityBody.error.code}`);
        return;
      }
      const slot = availabilityBody.data.slots[0];
      if (!slot) {
        log("no slots returned");
        return;
      }
      log(`picked slot ${slot.startsAt}`);

      const phone = `+49177${Math.floor(Math.random() * 9_000_000 + 1_000_000)}`;
      const idempotencyKey = crypto.randomUUID();
      log("POST booking …");
      const bookingResponse = await fetch(`/api/public/shops/${shopSlug}/bookings`, {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          serviceId,
          membershipId,
          startsAt: slot.startsAt,
          name: "Dev Flow Guest",
          phone,
        }),
      });
      const bookingBody = (await bookingResponse.json()) as PublicApiEnvelope<{
        manageUrl: string;
      }>;
      if ("error" in bookingBody) {
        log(`book error: ${bookingBody.error.code}`);
        return;
      }
      log(`booked → ${bookingBody.data.manageUrl}`);

      log("POST duplicate booking (expect SLOT_TAKEN + alternatives) …");
      const raceResponse = await fetch(`/api/public/shops/${shopSlug}/bookings`, {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({
          serviceId,
          membershipId,
          startsAt: slot.startsAt,
          name: "Dev Race Guest",
          phone: `+49178${Math.floor(Math.random() * 9_000_000 + 1_000_000)}`,
        }),
      });
      const raceBody = (await raceResponse.json()) as PublicApiEnvelope<unknown>;
      if ("error" in raceBody) {
        log(`race error: ${raceBody.error.code}`);
        log(`alternatives: ${raceBody.error.alternatives?.length ?? 0}`);
      } else {
        log("race unexpectedly succeeded");
      }

      log("done — open manage link in a new tab if needed");
    });
  }

  return (
    <div>
      <h1>Dev booking flow</h1>
      <p>Exercises availability → book → SLOT_TAKEN alternatives. Non-production only.</p>
      <button type="button" disabled={isPending} onClick={runFlow}>
        {isPending ? "Running…" : "Run flow"}
      </button>
      <pre>{logs.join("\n")}</pre>
    </div>
  );
}
