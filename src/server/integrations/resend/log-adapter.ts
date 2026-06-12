import "server-only";

import fs from "node:fs/promises";
import path from "node:path";

import type { EmailAdapter } from "./types";

const DEV_EMAILS_DIR = path.join(process.cwd(), ".dev-emails");

export function createLogEmailAdapter(): EmailAdapter {
  return async ({ to, subject, html, text, idempotencyKey }) => {
    await fs.mkdir(DEV_EMAILS_DIR, { recursive: true });
    const filePath = path.join(DEV_EMAILS_DIR, `${idempotencyKey}.html`);

    try {
      await fs.access(filePath);
      return { ok: true, id: `log-${idempotencyKey}` };
    } catch {
      // not yet written — proceed
    }

    const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${subject}</title></head><body>
<p><strong>To:</strong> ${to}</p>
<p><strong>Subject:</strong> ${subject}</p>
<hr>
${html}
<hr>
<pre style="white-space:pre-wrap;font-family:monospace;font-size:12px">${text}</pre>
</body></html>`;

    await fs.writeFile(filePath, body, "utf8");
    console.info(`[email-log] wrote ${filePath} → ${to} — ${subject}`);

    return { ok: true, id: `log-${idempotencyKey}` };
  };
}
