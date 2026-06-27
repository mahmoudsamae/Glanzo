/** Dev-only auth failure logging — never uses console.error (avoids Next.js error overlay spam). */
export function authFlowLog(
  stage: string,
  detail: Record<string, string | boolean | number | null | undefined>,
): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (detail.ok !== false) {
    return;
  }

  const payload = Object.fromEntries(
    Object.entries(detail).filter(([, value]) => value !== undefined),
  );

  console.warn(`[auth:${stage}]`, JSON.stringify(payload));
}
