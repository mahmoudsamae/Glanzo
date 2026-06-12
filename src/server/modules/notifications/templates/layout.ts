const ACCENT = "rgb(176, 141, 74)";
const INK = "rgb(28, 28, 30)";
const MUTED = "rgb(90, 90, 95)";
const BG = "rgb(248, 247, 244)";

export function emailLayout({
  headline,
  shopName,
  bodyHtml,
  cta,
}: {
  headline: string;
  shopName: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
}): { html: string; text: string } {
  const button = cta
    ? `<p style="margin:24px 0"><a href="${cta.href}" style="display:inline-block;padding:12px 20px;background:${ACCENT};color:${INK};text-decoration:none;border-radius:6px;font-weight:600">${cta.label}</a></p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="de">
<body style="margin:0;padding:24px;background:${BG};font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:${INK};line-height:1.5">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:rgb(255,255,255);border-radius:8px;padding:28px">
    <tr><td>
      <p style="margin:0 0 8px;font-size:13px;color:${MUTED};text-transform:uppercase;letter-spacing:0.04em">${shopName}</p>
      <h1 style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:600;color:${INK}">${headline}</h1>
      ${bodyHtml}
      ${button}
      <p style="margin:32px 0 0;font-size:12px;color:${MUTED}">Powered by Glanzo</p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `${shopName}\n\n${headline}\n\n${stripHtml(bodyHtml)}${cta ? `\n\n${cta.label}: ${cta.href}` : ""}\n\nPowered by Glanzo`;

  return { html, text };
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function detailRow(label: string, value: string): string {
  return `<p style="margin:0 0 10px"><span style="color:${MUTED}">${label}</span><br><strong>${value}</strong></p>`;
}
