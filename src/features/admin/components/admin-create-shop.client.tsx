"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { checkPlatformShopSlugAction, createPlatformShopAction } from "../api";
import { buildInviteAbsoluteUrl } from "@/lib/admin/invite-url";
import { buildOwnerInviteMessage, buildWhatsAppShareUrl } from "@/lib/admin/wa-me";
import { clientEnv } from "@/lib/env";
import { slugify } from "@/lib/slugify";
import { shopSlugSchema } from "@/lib/validations/shop";
import { platformCreateShopInputSchema } from "@/lib/validations/platform-admin";

const TIMEZONE_OPTIONS =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : ["Europe/Berlin", "Europe/London", "America/New_York"];

type SuccessPayload = {
  shopId: string;
  slug: string;
  inviteUrl: string;
  shopName: string;
};

function createShopErrorMessage(code: string): string {
  switch (code) {
    case "VALIDATION":
      return "Slug ungültig, reserviert oder bereits vergeben.";
    case "TIMEZONE_INVALID":
      return "Ungültige Zeitzone — bitte eine gültige IANA-Zeitzone wählen.";
    case "TEMPLATE_MISMATCH":
      return "Website-Vorlage konnte nicht angelegt werden. Bitte Migration auf Supabase anwenden.";
    case "FORBIDDEN":
      return "Kein Plattform-Zugang für dieses Konto.";
    case "EMAIL_TAKEN":
      return "Diese E-Mail ist bereits vergeben.";
    case "OWNER_EXISTS":
      return "Inhaber-Konto konnte nicht angelegt werden.";
    default:
      return "Shop konnte nicht erstellt werden. Bitte erneut versuchen oder Support kontaktieren.";
  }
}

export function AdminCreateShop() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerPasswordConfirm, setOwnerPasswordConfirm] = useState("");
  const [timezone, setTimezone] = useState("Europe/Berlin");
  const [slugAvailability, setSlugAvailability] = useState<"available" | "taken" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessPayload | null>(null);
  const [isPending, startTransition] = useTransition();

  const slugIsValid = slug ? shopSlugSchema.safeParse(slug).success : false;
  const slugStatus: "idle" | "checking" | "available" | "taken" | "invalid" = !slug
    ? "idle"
    : !slugIsValid
      ? "invalid"
      : slugAvailability === null
        ? "checking"
        : slugAvailability;

  useEffect(() => {
    if (!slug || !slugIsValid) {
      return;
    }
    const handle = window.setTimeout(() => {
      void checkPlatformShopSlugAction(slug).then((result) => {
        if (!result.ok) {
          setSlugAvailability("taken");
          return;
        }
        setSlugAvailability(result.available ? "available" : "taken");
      });
    }, 400);
    return () => window.clearTimeout(handle);
  }, [slug, slugIsValid]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      const suggested = slugify(value);
      if (suggested) {
        setSlug(suggested);
        setSlugAvailability(null);
      }
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
    setSlugAvailability(null);
  }

  const previewHost = useMemo(() => {
    const root = clientEnv.NEXT_PUBLIC_ROOT_DOMAIN.replace(/^[^.]+\./, "");
    return `${slug || "shop"}.${root}`;
  }, [slug]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const parsed = platformCreateShopInputSchema.safeParse({
      name,
      slug,
      ownerEmail,
      ownerPassword: ownerPassword.trim() ? ownerPassword : undefined,
      timezone,
    });
    if (!parsed.success || slugStatus === "taken" || slugStatus === "invalid") {
      setError("Bitte alle Felder prüfen.");
      return;
    }
    if (ownerPassword && ownerPassword !== ownerPasswordConfirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    startTransition(async () => {
      const result = await createPlatformShopAction(parsed.data);
      if (!result.ok) {
        setError(createShopErrorMessage(result.code));
        return;
      }
      const inviteUrl = buildInviteAbsoluteUrl(result.data.invitePath);
      setSuccess({
        shopId: result.data.shopId,
        slug: result.data.slug,
        inviteUrl,
        shopName: parsed.data.name,
      });
    });
  }

  if (success) {
    const message = buildOwnerInviteMessage(success.shopName, success.inviteUrl);
    const whatsAppUrl = buildWhatsAppShareUrl(null, message);

    return (
      <div className="mx-auto flex max-w-lg flex-col gap-[var(--space-6)]">
        <div>
          <h1 className="text-xl text-[var(--text-0)]">Shop erstellt</h1>
          <p className="mt-[var(--space-2)] text-sm text-[var(--text-2)]">
            {success.shopName} ({success.slug}) — Einladungslink an Inhaber senden.
          </p>
        </div>
        <code className="break-all rounded-md border border-border bg-[var(--ink-1)] p-[var(--space-3)] text-sm">
          {success.inviteUrl}
        </code>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          <Button type="button" variant="outline" onClick={() => void navigator.clipboard.writeText(success.inviteUrl)}>
            Link kopieren
          </Button>
          <Button type="button" asChild>
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
              Per WhatsApp senden
            </a>
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/admin/shops/${success.shopId}`}>Zum Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-lg flex-col gap-[var(--space-6)]">
      <div>
        <h1 className="text-xl text-[var(--text-0)]">Shop anlegen</h1>
        <p className="mt-[var(--space-1)] text-sm text-[var(--text-2)]">
          Counter-Signing: Shop erstellen, Link per WhatsApp an Inhaber.
        </p>
      </div>

      <div className="flex flex-col gap-[var(--space-4)]">
        <div className="flex flex-col gap-[var(--space-2)]">
          <Label htmlFor="shop-name">Shop-Name</Label>
          <Input
            id="shop-name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            required
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <Label htmlFor="shop-slug">Slug</Label>
          <Input
            id="shop-slug"
            value={slug}
            onChange={(event) => handleSlugChange(event.target.value)}
            required
            className="text-sm"
          />
          <p className="text-xs text-[var(--text-2)]">
            {previewHost}
            {slugStatus === "available" ? " · verfügbar" : null}
            {slugStatus === "taken" ? " · vergeben" : null}
            {slugStatus === "invalid" ? " · ungültig oder reserviert" : null}
          </p>
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <Label htmlFor="owner-email">Inhaber-E-Mail</Label>
          <Input
            id="owner-email"
            type="email"
            value={ownerEmail}
            onChange={(event) => setOwnerEmail(event.target.value)}
            required
            className="text-sm"
          />
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <Label htmlFor="owner-password">Inhaber-Passwort (optional)</Label>
          <Input
            id="owner-password"
            type="password"
            value={ownerPassword}
            onChange={(event) => setOwnerPassword(event.target.value)}
            placeholder="Min. 8 Zeichen — sofortiger Login"
            autoComplete="new-password"
            className="text-sm"
          />
          <Input
            id="owner-password-confirm"
            type="password"
            value={ownerPasswordConfirm}
            onChange={(event) => setOwnerPasswordConfirm(event.target.value)}
            placeholder="Passwort wiederholen"
            autoComplete="new-password"
            className="text-sm"
          />
          <p className="text-xs text-[var(--text-2)]">
            Mit Passwort wird das Inhaber-Konto direkt angelegt. Ohne Passwort nur Einladungslink.
          </p>
        </div>

        <div className="flex flex-col gap-[var(--space-2)]">
          <Label htmlFor="timezone">Zeitzone</Label>
          <select
            id="timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="h-10 rounded-md border border-border bg-transparent px-[var(--space-3)] text-sm"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-[var(--brass)]">{error}</p> : null}

      <div className="flex gap-[var(--space-2)]">
        <Button type="submit" disabled={isPending}>
          Shop erstellen
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/shops">Abbrechen</Link>
        </Button>
      </div>
    </form>
  );
}
