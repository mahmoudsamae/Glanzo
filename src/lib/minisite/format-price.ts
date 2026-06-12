const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format cents as EUR for the vintage price board. */
export function formatPriceCents(cents: number): string {
  return euroFormatter.format(cents / 100);
}
