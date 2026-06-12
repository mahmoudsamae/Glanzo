import type { AppointmentBlock } from "./availability.types";
import { blocksAvailability, dateInShopTimezone } from "./time-windows";

/**
 * Fair assignment: qualifying barber with the fewest active appointments that shop day.
 * Tie-break: lexicographically smallest membership id (stable, boring).
 */
export function pickFairBarber(
  candidates: string[],
  appointments: AppointmentBlock[],
  date: string,
  timezone: string,
): string | null {
  if (candidates.length === 0) {
    return null;
  }

  const counts = new Map(candidates.map((id) => [id, 0]));

  for (const appointment of appointments) {
    if (!blocksAvailability(appointment.status)) {
      continue;
    }
    if (dateInShopTimezone(appointment.startsAt, timezone) !== date) {
      continue;
    }
    if (counts.has(appointment.membershipId)) {
      counts.set(appointment.membershipId, (counts.get(appointment.membershipId) ?? 0) + 1);
    }
  }

  const sorted = [...counts.entries()].sort(
    ([idA, countA], [idB, countB]) => countA - countB || idA.localeCompare(idB),
  );

  return sorted[0]?.[0] ?? null;
}
