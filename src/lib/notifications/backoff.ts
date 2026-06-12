/** Minutes until retry after failure: 2^attempts (attempts already incremented at claim). */
export function backoffMinutes(attempts: number): number {
  return 2 ** Math.max(1, attempts);
}

export function shouldMarkDead(attempts: number): boolean {
  return attempts >= 5;
}

export function nextRetryAt(attempts: number, from: Date = new Date()): Date {
  return new Date(from.getTime() + backoffMinutes(attempts) * 60_000);
}
