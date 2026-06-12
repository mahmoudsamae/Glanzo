import { describe, expect, it } from "vitest";

import {
  formatEmailTime,
  formatEmailWeekdayDate,
} from "@/lib/notifications/format-email-datetime";
import {
  DUMMY_NOTIFICATION_CONTEXT,
  renderNotificationTemplate,
} from "@/server/modules/notifications/templates";

const TZ = "Europe/Berlin";
const STARTS_AT = "2026-10-05T07:00:00.000Z";

function contextWithLiveDates() {
  return {
    ...DUMMY_NOTIFICATION_CONTEXT,
    weekdayDate: formatEmailWeekdayDate(STARTS_AT, TZ),
    timeLabel: formatEmailTime(STARTS_AT, TZ),
    oneLineWhen: "Montag, 5. Oktober 2026, 09:00 Uhr",
    manageUrl: "https://glanzo.app/bookings/abc123",
    minisiteUrl: "https://demo-barber-a.glanzo.app",
    calendarUrl: "https://glanzo.app/d/calendar?date=2026-10-05",
  };
}

describe("notification templates", () => {
  it.each([
    ["booking_confirmed", "Gebucht."],
    ["reminder_24h", "Bis morgen."],
    ["booking_cancelled", "Storniert."],
    ["owner_new_booking", "Neue Buchung."],
  ] as const)("renders %s subject headline", (template, headline) => {
    const rendered = renderNotificationTemplate(template, contextWithLiveDates());
    expect(rendered.subject).toContain(headline);
    expect(rendered.html).toContain(headline);
    expect(rendered.text).toContain(headline);
    expect(rendered.html).not.toContain("undefined");
    expect(rendered.text).not.toContain("undefined");
  });

  it("booking_confirmed includes manage link and Berlin time", () => {
    const rendered = renderNotificationTemplate("booking_confirmed", contextWithLiveDates());
    expect(rendered.html).toContain("Termin verwalten");
    expect(rendered.html).toContain("https://glanzo.app/bookings/abc123");
    expect(rendered.html).toContain("09:00 Uhr");
    expect(rendered.html).toContain("Montag, 5. Oktober 2026");
  });

  it("reminder is a single summary line", () => {
    const rendered = renderNotificationTemplate("reminder_24h", contextWithLiveDates());
    expect(rendered.text).toContain("Skin Fade bei Alex");
    expect(rendered.html).toContain("Termin verwalten");
  });

  it("booking_cancelled links to mini-site book flow", () => {
    const rendered = renderNotificationTemplate("booking_cancelled", contextWithLiveDates());
    expect(rendered.html).toContain("Neu buchen");
    expect(rendered.html).toContain("?book=1");
  });

  it("owner_new_booking links to calendar", () => {
    const rendered = renderNotificationTemplate("owner_new_booking", contextWithLiveDates());
    expect(rendered.html).toContain("Im Kalender öffnen");
    expect(rendered.html).toContain("/d/calendar?date=2026-10-05");
  });
});
