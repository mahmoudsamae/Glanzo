/** Strip to digits for German national entry (no country code). */
export function digitsFromPhoneInput(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Visual grouping for +49 entry — national digits only in the input.
 * Example display prefix: +49 · 170 1234567
 */
export function formatGermanPhoneVisual(digits: string): string {
  const d = digits.replace(/^0+/, "").slice(0, 11);
  if (d.length <= 3) {
    return d;
  }
  if (d.length <= 6) {
    return `${d.slice(0, 3)} ${d.slice(3)}`;
  }
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/** Build raw string for E.164 normalization (+49 default). */
export function germanPhoneRawFromDigits(digits: string): string {
  const d = digits.replace(/^0+/, "");
  if (!d) {
    return "";
  }
  return `+49${d}`;
}
