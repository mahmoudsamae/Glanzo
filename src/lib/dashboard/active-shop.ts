/**
 * // DECISION: Multi-shop owners/barbers see the earliest membership by created_at.
 * Memberships must already be sorted ascending by `createdAt` (see getActor).
 */
export function getActiveMembership<T>(memberships: T[]): T | null {
  return memberships[0] ?? null;
}
