import type { ShopPublicData } from "@/lib/validations/public-shop";
import { formatOpeningHoursLines } from "@/lib/shops/opening-hours.format";

type HoursLine = { label: string; value: string };

function isClosed(value: string): boolean {
  const lower = value.toLowerCase();
  return lower.includes("geschlossen") || lower === "closed";
}

/** Compact one-line summary for the kontakt reach strip. */
export function compactOpeningHoursSummary(lines: HoursLine[]): string {
  if (lines.length === 0) {
    return "";
  }

  const open = lines.filter((line) => !isClosed(line.value));
  if (open.length === 0) {
    return "Geschlossen";
  }

  const values = new Set(open.map((line) => line.value));
  if (values.size === 1 && open.length >= 4) {
    const first = open[0]!.label.slice(0, 2);
    const last = open[open.length - 1]!.label.slice(0, 2);
    return `${first}–${last} ${open[0]!.value}`;
  }

  return open.map((line) => `${line.label.slice(0, 2)} ${line.value}`).join(" · ");
}

export function forgeKontaktHoursSummary(data: ShopPublicData): string {
  const custom = data.minisite.content.sections?.contact?.subtitle?.trim();
  if (custom) {
    const firstLine = custom.split("\n").map((line) => line.trim()).find(Boolean);
    if (firstLine) {
      return firstLine;
    }
  }

  return compactOpeningHoursSummary(formatOpeningHoursLines(data.shop.opening_hours));
}
