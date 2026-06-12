"use client";

import Link from "next/link";
import { Facebook, Globe, Instagram, MapPin, MessageCircle, Music2 } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deriveAccentPalette } from "@/lib/color/accent";
import { MINISITE_ACCENT_PRESETS } from "@/lib/minisite/accent-presets";
import { buildShopMinisiteUrl } from "@/lib/dashboard/minisite-url";
import type { MinisiteLinks } from "@/lib/validations/minisite-links";
import type { MinisiteSaveInput } from "@/lib/validations/minisite-editor";
import type { MinisiteContent, MinisiteTemplate } from "@/lib/validations/public-shop";
import type { MinisiteEditorData } from "@/lib/minisite/editor-types";

import { saveMinisiteAction } from "../api";
import { shopMediaPublicUrl } from "../lib/media-url";
import { MINISITE_TEMPLATES } from "../templates/registry";

import type { MinisitePreviewPane as MinisitePreviewPaneType } from "./minisite-preview-pane.client";

type PreviewComponent = typeof MinisitePreviewPaneType;

type MinisiteEditorProps = {
  initial: MinisiteEditorData;
};

type MobileTab = "form" | "preview";

export function MinisiteEditor({ initial }: MinisiteEditorProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("form");
  const [template, setTemplate] = useState<MinisiteTemplate>(initial.template);
  const [accentHex, setAccentHex] = useState(initial.accentHex);
  const [content, setContent] = useState<MinisiteContent>(initial.content);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [PreviewPane, setPreviewPane] = useState<PreviewComponent | null>(null);
  const [previewWanted, setPreviewWanted] = useState(false);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const update = () => setPreviewWanted(mobileTab === "preview" || lg.matches);
    update();
    lg.addEventListener("change", update);
    return () => lg.removeEventListener("change", update);
  }, [mobileTab]);

  useEffect(() => {
    if (!previewWanted || PreviewPane) {
      return;
    }
    let cancelled = false;
    void import("./minisite-preview-pane.client").then((module) => {
      if (!cancelled) {
        setPreviewPane(() => module.MinisitePreviewPane);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [PreviewPane, previewWanted]);

  const draft = useMemo<MinisiteSaveInput>(
    () => ({ template, accentHex, content }),
    [accentHex, content, template],
  );

  const accentChip = useMemo(
    () => deriveAccentPalette(accentHex, template),
    [accentHex, template],
  );

  const viewSiteUrl = buildShopMinisiteUrl(initial.shopSlug);

  function patchContent(patch: Partial<MinisiteContent>) {
    setContent((current) => ({ ...current, ...patch }));
  }

  function patchLinks(field: keyof MinisiteLinks, value: string) {
    setContent((current) => ({
      ...current,
      links: {
        ...(current.links ?? {}),
        [field]: value.trim() || undefined,
      },
    }));
  }

  async function handleUpload(kind: "logo" | "cover" | "gallery", file: File) {
    setUploading(kind);
    setError(null);
    const { uploadShopMediaFile } = await import("../lib/upload-media.client");
    const result = await uploadShopMediaFile(initial.shopId, kind, file);
    setUploading(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (kind === "logo") {
      patchContent({ logo_path: result.path });
    } else if (kind === "cover") {
      patchContent({ cover_path: result.path });
    } else {
      const gallery = [...(content.gallery ?? []), result.path].slice(0, 8);
      patchContent({ gallery });
    }
  }

  function moveGallery(index: number, direction: -1 | 1) {
    const gallery = [...(content.gallery ?? [])];
    const target = index + direction;
    if (target < 0 || target >= gallery.length) {
      return;
    }
    const [item] = gallery.splice(index, 1);
    gallery.splice(target, 0, item!);
    patchContent({ gallery });
  }

  function removeGallery(index: number) {
    const gallery = [...(content.gallery ?? [])];
    gallery.splice(index, 1);
    patchContent({ gallery: gallery.length ? gallery : undefined });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveMinisiteAction(draft);
      if (!result.ok) {
        setError("Speichern fehlgeschlagen.");
        return;
      }
      setToast("Live.");
    });
  }

  const formPane = (
    <div className="flex flex-col gap-[var(--space-8)]">
      <section className="space-y-[var(--space-3)]">
        <h2 className="text-sm font-medium text-[var(--text-0)]">Vorlage</h2>
        <div className="grid grid-cols-1 gap-[var(--space-2)] sm:grid-cols-3">
          {(Object.keys(MINISITE_TEMPLATES) as MinisiteTemplate[]).map((key) => {
            const item = MINISITE_TEMPLATES[key];
            const active = template === key;
            return (
              <button
                key={key}
                type="button"
                className={`rounded-md border px-[var(--space-3)] py-[var(--space-4)] text-left transition-colors ${
                  active
                    ? "border-[var(--brass)] bg-[var(--ink-2)]"
                    : "border-[var(--ink-3)] hover:border-[var(--ink-4)]"
                }`}
                onClick={() => setTemplate(key)}
              >
                <span className="font-display text-md">{item.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-[var(--space-3)]">
        <h2 className="text-sm font-medium text-[var(--text-0)]">Akzentfarbe</h2>
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {MINISITE_ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              title={preset.label}
              className={`size-9 rounded-full border-2 ${
                accentHex.toLowerCase() === preset.hex.toLowerCase()
                  ? "border-[var(--text-0)]"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: preset.hex }}
              onClick={() => setAccentHex(preset.hex)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <Label htmlFor="accent-custom" className="sr-only">
            Eigene Farbe
          </Label>
          <Input
            id="accent-custom"
            value={accentHex}
            onChange={(e) => setAccentHex(e.target.value)}
            className="max-w-[8rem] font-mono text-sm"
            placeholder="000000"
          />
          <span
            className="inline-flex items-center rounded-md px-[var(--space-3)] py-[var(--space-2)] text-sm"
            style={{
              backgroundColor: accentChip.accent,
              color: accentChip.onAccent,
            }}
          >
            AA Vorschau
          </span>
        </div>
      </section>

      <section className="space-y-[var(--space-3)]">
        <h2 className="text-sm font-medium text-[var(--text-0)]">Inhalt</h2>
        <div className="space-y-[var(--space-3)]">
          <div>
            <Label htmlFor="hero">Hero-Überschrift</Label>
            <Input
              id="hero"
              value={content.hero_headline ?? ""}
              onChange={(e) => patchContent({ hero_headline: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="about">Über uns</Label>
            <textarea
              id="about"
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-[var(--space-3)] py-[var(--space-2)] text-sm"
              value={content.about ?? ""}
              onChange={(e) => patchContent({ about: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={content.address ?? ""}
              onChange={(e) => patchContent({ address: e.target.value || undefined })}
            />
          </div>
        </div>
      </section>

      <section className="space-y-[var(--space-4)]">
        <h2 className="text-sm font-medium text-[var(--text-0)]">Links</h2>
        <div className="grid gap-[var(--space-3)] sm:grid-cols-2">
          <LinkField
            id="link-instagram"
            label="Instagram"
            icon={Instagram}
            value={content.links?.instagram ?? content.instagram ?? ""}
            placeholder="@salon oder URL"
            onChange={(value) => {
              patchLinks("instagram", value);
              if (content.instagram) {
                patchContent({ instagram: undefined });
              }
            }}
          />
          <LinkField
            id="link-facebook"
            label="Facebook"
            icon={Facebook}
            value={content.links?.facebook ?? ""}
            placeholder="https://facebook.com/…"
            onChange={(value) => patchLinks("facebook", value)}
          />
          <LinkField
            id="link-tiktok"
            label="TikTok"
            icon={Music2}
            value={content.links?.tiktok ?? ""}
            placeholder="https://tiktok.com/@…"
            onChange={(value) => patchLinks("tiktok", value)}
          />
          <LinkField
            id="link-whatsapp"
            label="WhatsApp"
            icon={MessageCircle}
            value={content.links?.whatsapp ?? ""}
            placeholder="wa.me/49170…"
            onChange={(value) => patchLinks("whatsapp", value)}
          />
          <LinkField
            id="link-maps"
            label="Google Maps"
            icon={MapPin}
            value={content.links?.google_maps ?? ""}
            placeholder="https://maps.google.com/…"
            onChange={(value) => patchLinks("google_maps", value)}
          />
          <LinkField
            id="link-website"
            label="Website"
            icon={Globe}
            value={content.links?.website ?? ""}
            placeholder="https://…"
            onChange={(value) => patchLinks("website", value)}
          />
        </div>
      </section>

      <section className="space-y-[var(--space-4)]">
        <h2 className="text-sm font-medium text-[var(--text-0)]">Bilder</h2>
        <UploadRow
          label="Logo"
          path={content.logo_path}
          uploading={uploading === "logo"}
          onPick={(file) => void handleUpload("logo", file)}
          onClear={() => patchContent({ logo_path: undefined })}
        />
        <UploadRow
          label="Titelbild"
          path={content.cover_path}
          uploading={uploading === "cover"}
          onPick={(file) => void handleUpload("cover", file)}
          onClear={() => patchContent({ cover_path: undefined })}
        />
        <div className="space-y-[var(--space-2)]">
          <div className="flex items-center justify-between">
            <Label>Galerie (max. 8)</Label>
            <label className="cursor-pointer text-sm text-[var(--brass)]">
              {uploading === "gallery" ? "Lädt…" : "+ Foto"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={(content.gallery?.length ?? 0) >= 8 || uploading === "gallery"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUpload("gallery", file);
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <ul className="space-y-[var(--space-2)]">
            {(content.gallery ?? []).map((path, index) => (
              <li
                key={path}
                className="flex items-center gap-[var(--space-2)] rounded-md border border-[var(--ink-3)] p-[var(--space-2)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shopMediaPublicUrl(path)}
                  alt=""
                  className="size-12 rounded object-cover"
                />
                <span className="flex-1 truncate text-xs text-[var(--text-2)]">{path}</span>
                <Button type="button" size="sm" variant="ghost" onClick={() => moveGallery(index, -1)}>
                  ↑
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => moveGallery(index, 1)}>
                  ↓
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => removeGallery(index)}>
                  ×
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-[var(--space-3)]">
        <Button type="button" disabled={isPending} onClick={save}>
          {isPending ? "Speichert…" : "Speichern"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={viewSiteUrl} target="_blank" rel="noopener noreferrer">
            Seite ansehen
          </Link>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-[var(--space-4)] py-[var(--space-8)]">
      <header className="mb-[var(--space-8)]">
        <h1 className="font-display text-2xl text-[var(--text-0)]">Minisite</h1>
        <p className="text-sm text-[var(--text-2)]">Speichern = live — keine Entwürfe.</p>
      </header>

      <div className="mb-[var(--space-4)] flex gap-[var(--space-2)] lg:hidden">
        <Button
          type="button"
          variant={mobileTab === "form" ? "default" : "outline"}
          onClick={() => setMobileTab("form")}
        >
          Bearbeiten
        </Button>
        <Button
          type="button"
          variant={mobileTab === "preview" ? "default" : "outline"}
          onClick={() => setMobileTab("preview")}
        >
          Vorschau
        </Button>
      </div>

      <div className="grid gap-[var(--space-8)] lg:grid-cols-2">
        <div className={mobileTab === "preview" ? "hidden lg:block" : ""}>{formPane}</div>
        <div
          className={`${mobileTab === "form" ? "hidden lg:block" : ""} lg:sticky lg:top-[var(--space-8)] lg:self-start`}
        >
          {PreviewPane ? (
            <PreviewPane
              shopSlug={initial.shopSlug}
              publicData={initial.publicData}
              draft={draft}
            />
          ) : previewWanted ? (
            <p className="text-sm text-[var(--text-2)]">Vorschau lädt…</p>
          ) : null}
        </div>
      </div>

      {toast ? (
        <div
          className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-[var(--space-4)] right-[var(--space-4)] z-50 mx-auto flex max-w-[360px] items-center justify-between gap-[var(--space-3)] rounded-sm border border-border bg-[var(--ink-1)] px-[var(--space-4)] py-[var(--space-3)] text-sm shadow-lg lg:bottom-[var(--space-4)]"
          role="status"
        >
          <span>
            {toast}{" "}
            <Link href={viewSiteUrl} className="text-[var(--brass)] underline" target="_blank">
              Seite ansehen
            </Link>
          </span>
          <button type="button" className="text-muted-foreground" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}

function LinkField({
  id,
  label,
  icon: Icon,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  icon: typeof Instagram;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-[var(--space-2)]">
      <Label htmlFor={id} className="inline-flex items-center gap-[var(--space-2)]">
        <Icon className="size-4 text-[var(--text-2)]" strokeWidth={1.5} aria-hidden />
        {label}
      </Label>
      <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

type UploadRowProps = {
  label: string;
  path?: string;
  uploading: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
};

function UploadRow({ label, path, uploading, onPick, onClear }: UploadRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-[var(--space-3)]">
      <span className="w-20 text-sm text-[var(--text-2)]">{label}</span>
      {path ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shopMediaPublicUrl(path)} alt="" className="size-14 rounded object-cover" />
          <Button type="button" size="sm" variant="ghost" onClick={onClear}>
            Entfernen
          </Button>
        </>
      ) : null}
      <label className="cursor-pointer text-sm text-[var(--brass)]">
        {uploading ? "Lädt…" : path ? "Ersetzen" : "Hochladen"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onPick(file);
            }
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
