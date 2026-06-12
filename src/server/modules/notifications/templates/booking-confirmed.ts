import { detailRow, emailLayout } from "./layout";
import type { NotificationRenderContext, RenderedEmail } from "./types";

export function renderBookingConfirmed(ctx: NotificationRenderContext): RenderedEmail {
  const bodyHtml = [
    detailRow("Wann", `${ctx.weekdayDate}<br>${ctx.timeLabel}`),
    detailRow("Service", ctx.serviceName),
    detailRow("Barber", ctx.barberName),
    detailRow("Preis", ctx.priceFormatted),
    ctx.shopAddress ? detailRow("Adresse", ctx.shopAddress) : "",
  ].join("");

  const { html, text } = emailLayout({
    headline: "Gebucht.",
    shopName: ctx.shopName,
    bodyHtml,
    cta: { label: "Termin verwalten", href: ctx.manageUrl },
  });

  return { subject: `Gebucht. — ${ctx.shopName}`, html, text };
}
