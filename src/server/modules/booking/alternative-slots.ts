import type { AvailabilitySlot } from "@/server/modules/availability";

/**
 * When SLOT_TAKEN, return the nearest alternative start times (default 3).
 */
export function pickNearestAlternativeSlots(
  slots: AvailabilitySlot[],
  requestedStartsAt: Date,
  limit = 3,
): AvailabilitySlot[] {
  if (slots.length === 0 || limit <= 0) {
    return [];
  }

  const target = requestedStartsAt.getTime();

  return [...slots]
    .sort((a, b) => {
      const delta =
        Math.abs(a.startsAt.getTime() - target) - Math.abs(b.startsAt.getTime() - target);
      if (delta !== 0) {
        return delta;
      }
      return a.startsAt.getTime() - b.startsAt.getTime() || a.membershipId.localeCompare(b.membershipId);
    })
    .slice(0, limit);
}
