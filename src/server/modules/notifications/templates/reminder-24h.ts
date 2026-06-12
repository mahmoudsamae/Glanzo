import { emailLayout } from "./layout";
import type { NotificationRenderContext, RenderedEmail } from "./types";

export function renderReminder24h(ctx: NotificationRenderContext): RenderedEmail {
  const bodyHtml = `<p style="margin:0">${ctx.serviceName} bei ${ctx.barberName} — ${ctx.oneLineWhen}.</p>`;

  const { html, text } = emailLayout({
    headline: "Bis morgen.",
    shopName: ctx.shopName,
    bodyHtml,
    cta: { label: "Termin verwalten", href: ctx.manageUrl },
  });

  return { subject: `Bis morgen. — ${ctx.shopName}`, html, text };
}
