import { detailRow, emailLayout } from "./layout";
import type { NotificationRenderContext, RenderedEmail } from "./types";

export function renderBookingCancelled(ctx: NotificationRenderContext): RenderedEmail {
  const bodyHtml = [
    detailRow("Was", `${ctx.serviceName} bei ${ctx.barberName}`),
    detailRow("Wann", `${ctx.weekdayDate}, ${ctx.timeLabel}`),
  ].join("");

  const { html, text } = emailLayout({
    headline: "Storniert.",
    shopName: ctx.shopName,
    bodyHtml,
    cta: { label: "Neu buchen", href: `${ctx.minisiteUrl}?book=1` },
  });

  return { subject: `Storniert. — ${ctx.shopName}`, html, text };
}
