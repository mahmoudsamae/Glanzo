/** Civil-date arithmetic on YYYY-MM-DD (timezone-independent). */
export function addIsoDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + days));
  return utc.toISOString().slice(0, 10);
}

export function datesFromStart(startDate: string, count: number): string[] {
  return Array.from({ length: count }, (_, index) => addIsoDays(startDate, index));
}
