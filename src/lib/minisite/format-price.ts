const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  const key = currency.toUpperCase();
  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: key,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    );
  }
  return formatterCache.get(key)!;
}

/** Format cents as a currency amount. Defaults to EUR (de-DE) when no currency specified. */
export function formatPriceCents(cents: number, currency?: string | null): string {
  const code = currency?.trim().toUpperCase();
  if (code && code.length === 3 && code !== "EUR") {
    try {
      return getFormatter(code).format(cents / 100);
    } catch {
      // Invalid currency code — fall back to EUR
    }
  }
  return euroFormatter.format(cents / 100);
}
