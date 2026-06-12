import { timingSafeEqual } from "node:crypto";

/** Runtime CRON secret (read per request so tests can stub env). */
export function configuredCronSecret(): string | undefined {
  const value = process.env.CRON_SECRET?.trim();
  return value && value.length >= 16 ? value : undefined;
}

/** Constant-time compare for CRON_SECRET header vs configured secret. */
export function isValidCronSecret(provided: string | null | undefined, expected: string): boolean {
  if (!provided || !expected) {
    return false;
  }

  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    return false;
  }

  return timingSafeEqual(a, b);
}
