import type { NotificationRenderContext } from "./types";

export const DUMMY_NOTIFICATION_CONTEXT: NotificationRenderContext = {
  shopName: "Demo Barber A",
  shopSlug: "demo-barber-a",
  shopTimezone: "Europe/Berlin",
  shopAddress: "Hauptstraße 12, 10115 Berlin",
  customerName: "Max Mustermann",
  serviceName: "Skin Fade",
  barberName: "Alex",
  priceFormatted: "25 €",
  weekdayDate: "Montag, 5. Oktober 2026",
  timeLabel: "09:00 Uhr",
  oneLineWhen: "Montag, 5. Oktober, 09:00 Uhr",
  manageUrl: "https://demo-barber-a.glanzo.app/bookings/preview-token",
  minisiteUrl: "https://demo-barber-a.glanzo.app",
  calendarUrl: "https://glanzo.app/d/calendar?date=2026-10-05",
  sourceLabel: "Online",
};
