export type HourBucket = { hour: number; count: number };

/** Fill missing hours 0–23 for a stable support histogram display. */
export function normalizeHourlyHistogram(buckets: HourBucket[]): HourBucket[] {
  const map = new Map(buckets.map((b) => [b.hour, b.count]));
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: map.get(hour) ?? 0,
  }));
}
