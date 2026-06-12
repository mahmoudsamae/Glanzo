import { z } from "zod";

const optionalHttpUrl = (label: string) =>
  z
    .string()
    .trim()
    .max(500)
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/i.test(value), {
      message: `${label} muss mit http(s):// beginnen.`,
    });

const whatsAppUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => {
      if (!value) {
        return true;
      }
      if (/^https:\/\/wa\.me\/\d+/.test(value)) {
        return true;
      }
      return /^\+?[0-9]{6,15}$/.test(value.replace(/\s/g, ""));
    },
    { message: "WhatsApp: wa.me/… oder E.164-Nummer." },
  );

export const minisiteLinksObjectSchema = z
  .object({
    instagram: z
      .string()
      .trim()
      .max(120)
      .optional()
      .refine(
        (value) => !value || /^https?:\/\//.test(value) || /^@?[a-zA-Z0-9._]+$/.test(value),
        { message: "Instagram: URL oder @handle." },
      ),
    facebook: optionalHttpUrl("Facebook"),
    tiktok: optionalHttpUrl("TikTok"),
    whatsapp: whatsAppUrlSchema,
    google_maps: optionalHttpUrl("Google Maps"),
    website: optionalHttpUrl("Website"),
  })
  .strict();

export const minisiteLinksSchema = minisiteLinksObjectSchema.optional();

export type MinisiteLinks = z.infer<typeof minisiteLinksObjectSchema>;

export function normalizeWhatsAppUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https:\/\/wa\.me\//.test(trimmed)) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : trimmed;
}

export function resolveMinisiteLinks(
  links: MinisiteLinks | undefined,
  legacyInstagram?: string | null,
): MinisiteLinks | undefined {
  const merged: Record<string, string | undefined> = { ...(links ?? {}) };
  if (!merged.instagram && legacyInstagram?.trim()) {
    merged.instagram = legacyInstagram.trim();
  }
  const cleaned = Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value && String(value).trim()),
  );
  return Object.keys(cleaned).length ? (cleaned as MinisiteLinks) : undefined;
}

export function linksToSameAs(links: MinisiteLinks | undefined): string[] {
  if (!links) {
    return [];
  }
  const out: string[] = [];
  const push = (value?: string) => {
    if (value?.trim()) {
      out.push(value.trim());
    }
  };
  if (links.instagram) {
    push(
      /^https?:\/\//.test(links.instagram)
        ? links.instagram
        : `https://instagram.com/${links.instagram.replace(/^@/, "")}`,
    );
  }
  push(links.facebook);
  push(links.tiktok);
  if (links.whatsapp) {
    push(normalizeWhatsAppUrl(links.whatsapp));
  }
  push(links.google_maps);
  push(links.website);
  return out;
}

/** Network-error fallback chain: WhatsApp → Instagram → plain message. */
export function bookingContactFallback(links: MinisiteLinks | undefined): {
  href: string | null;
  label: string;
} {
  if (links?.whatsapp) {
    const href = normalizeWhatsAppUrl(links.whatsapp);
    return { href, label: "Per WhatsApp schreiben" };
  }
  if (links?.instagram) {
    const handle = links.instagram.replace(/^@/, "");
    const href = /^https?:\/\//.test(links.instagram)
      ? links.instagram
      : `https://instagram.com/${handle}`;
    return { href, label: `@${handle} auf Instagram` };
  }
  return { href: null, label: "Bitte versuche es erneut." };
}
