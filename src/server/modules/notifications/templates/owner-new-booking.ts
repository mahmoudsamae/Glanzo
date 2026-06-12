import { detailRow, emailLayout } from "./layout";
import type { NotificationRenderContext, RenderedEmail } from "./types";

export function renderOwnerNewBooking(ctx: NotificationRenderContext): RenderedEmail {
  const bodyHtml = [
    detailRow("Kunde", ctx.customerName),
    detailRow("Service", ctx.serviceName),
    detailRow("Wann", `${ctx.weekdayDate}, ${ctx.timeLabel}`),
    detailRow("Quelle", ctx.sourceLabel),
  ].join("");

  const { html, text } = emailLayout({
    headline: "Neue Buchung.",
    shopName: ctx.shopName,
    bodyHtml,
    cta: { label: "Im Kalender öffnen", href: ctx.calendarUrl },
  });

  return { subject: `Neue Buchung. — ${ctx.shopName}`, html, text };
}
