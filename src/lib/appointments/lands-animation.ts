/**
 * Track appointment ids that have already played the "booking lands" animation.
 * Never re-animate on refetch — only genuinely new ids trigger.
 */
export function filterNewLandingIds(
  seenIds: ReadonlySet<string>,
  appointmentIds: string[],
): string[] {
  return appointmentIds.filter((id) => !seenIds.has(id));
}

export function mergeSeenIds(
  seenIds: ReadonlySet<string>,
  newIds: string[],
): Set<string> {
  const next = new Set(seenIds);
  for (const id of newIds) {
    next.add(id);
  }
  return next;
}
