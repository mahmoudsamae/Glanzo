function formatIcsUtc(iso: string): string {
  const date = new Date(iso);
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export type BookingIcsInput = {
  shopName: string;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  uid?: string;
};

/** Tiny client-side .ics for add-to-calendar (no deps). */
export function generateBookingIcs(input: BookingIcsInput): string {
  const uid = input.uid ?? `${Date.now()}@glanzo.app`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Glanzo//Booking//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtc(new Date().toISOString())}`,
    `DTSTART:${formatIcsUtc(input.startsAt)}`,
    `DTEND:${formatIcsUtc(input.endsAt)}`,
    `SUMMARY:${escapeIcsText(`${input.serviceName} — ${input.shopName}`)}`,
  ];

  if (input.location) {
    lines.push(`LOCATION:${escapeIcsText(input.location)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function downloadBookingIcs(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
