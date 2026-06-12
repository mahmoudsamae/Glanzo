const E164_RE = /^\+[1-9]\d{1,14}$/;

/**
 * Normalize a phone number to E.164. German (+49) default when no country code is present.
 * Returns null when the result is not valid E.164.
 */
export function normalizePhoneToE164(
  raw: string,
  defaultRegion: "DE" = "DE",
): string | null {
  let value = raw.trim();
  if (!value) {
    return null;
  }

  value = value.replace(/[\s().-]/g, "");

  if (value.startsWith("00")) {
    value = `+${value.slice(2)}`;
  } else if (value.startsWith("+")) {
    // already international
  } else if (defaultRegion === "DE" && value.startsWith("0")) {
    value = `+49${value.slice(1)}`;
  } else if (defaultRegion === "DE") {
    value = `+49${value}`;
  } else {
    return null;
  }

  if (!E164_RE.test(value)) {
    return null;
  }

  const digits = value.slice(1);
  if (digits.length < 8 || digits.length > 15) {
    return null;
  }

  return value;
}

export function isValidE164Phone(phone: string): boolean {
  return E164_RE.test(phone);
}
