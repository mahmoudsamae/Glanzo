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

export function AdminCreateShop() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
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
      timezone,
    });
    if (!parsed.success || slugStatus === "taken" || slugStatus === "invalid") {
      setError("Bitte alle Felder prüfen.");
      return;
    }

    startTransition(async () => {
      const result = await createPlatformShopAction(parsed.data);
      if (!result.ok) {
        setError(
          result.code === "VALIDATION"
            ? "Slug ungültig, reserviert oder bereits vergeben."
            : "Shop konnte nicht erstellt werden.",
        );
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
