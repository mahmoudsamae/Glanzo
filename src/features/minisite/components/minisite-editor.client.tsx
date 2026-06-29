"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPrimaryButton,
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { buildShopMinisiteUrl } from "@/lib/dashboard/minisite-url";
import type { MinisiteSaveInput, ShopMediaKind } from "@/lib/validations/minisite-editor";
import type { MinisiteContent } from "@/lib/validations/public-shop";
import type { MinisiteEditorData } from "@/lib/minisite/editor-types";
import { patchNicolesNewsItem } from "@/lib/minisite/nicoles-sections";

import { saveMinisiteAction } from "../api";
import { MinisiteSectionsPanel } from "./minisite-sections-panel.client";

import type { MinisitePreviewPane as MinisitePreviewPaneType } from "./minisite-preview-pane.client";

type PreviewComponent = typeof MinisitePreviewPaneType;

type MinisiteSaveResult = { ok: true } | { ok: false; code?: string };

type MinisiteEditorProps = {
  initial: MinisiteEditorData;
  saveAction?: (input: MinisiteSaveInput) => Promise<MinisiteSaveResult>;
  backHref?: string;
  header?: {
    kicker: string;
    title: string;
    subtitle: string;
  };
};

type MobileTab = "form" | "preview";

export function MinisiteEditor({
  initial,
  saveAction = saveMinisiteAction,
  backHref,
  header,
}: MinisiteEditorProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("form");
  const [template, setTemplate] = useState(initial.template);
  const [accentHex, setAccentHex] = useState(initial.accentHex);
  const [content, setContent] = useState<MinisiteContent>(initial.content);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [PreviewPane, setPreviewPane] = useState<PreviewComponent | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("./minisite-preview-pane.client").then((module) => {
      if (!cancelled) {
        setPreviewPane(() => module.MinisitePreviewPane);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const draft = useMemo<MinisiteSaveInput>(
    () => ({ template, accentHex, content }),
    [accentHex, content, template],
  );

  const viewSiteUrl = buildShopMinisiteUrl(initial.shopSlug);

  async function handleUpload(kind: ShopMediaKind, file: File) {
    setUploading(kind);
    setError(null);

    const path = await uploadMediaFile(kind, file);
    if (!path) return;
    applyUploadedPath(kind, path);
  }

  async function handleSectionImageUpload(
    target: {
      section: string;
      field: "image_path" | "image_paths";
      index?: number;
    },
    file: File,
  ) {
    const uploadKey =
      target.section === "news" ? `news-${target.index ?? 0}` : `section-${target.section}`;
    setUploading(uploadKey);
    setError(null);

    const path = await uploadMediaFile("gallery", file);
    setUploading(null);
    if (!path) return;

    setContent((current) => {
      if (target.section === "news") {
        return patchNicolesNewsItem(current, target.index ?? 0, { image_path: path });
      }

      const sections = { ...(current.sections ?? {}) };
      const block = { ...(sections[target.section as keyof typeof sections] ?? {}) };

      if (target.field === "image_path") {
        sections[target.section as keyof typeof sections] = { ...block, image_path: path };
      } else {
        const paths = [...((block as { image_paths?: string[] }).image_paths ?? [])];
        if (target.index !== undefined) {
          paths[target.index] = path;
        } else {
          paths.push(path);
        }
        sections[target.section as keyof typeof sections] = {
          ...block,
          image_paths: paths.filter(Boolean).slice(0, 8),
        };
      }

      return { ...current, sections };
    });
    setToast("Bild hochgeladen — bitte speichern.");
  }

  async function uploadMediaFile(kind: ShopMediaKind, file: File): Promise<string | null> {
    const { uploadShopMediaFile } = await import("../lib/upload-media.client");

    // Hero videos upload directly to storage — server actions hit Next.js body size limits.
    if (kind === "hero_video") {
      const result = await uploadShopMediaFile(initial.shopId, kind, file);
      setUploading(null);
      if (!result.ok) {
        setError(result.message);
        return null;
      }
      return result.path;
    }

    if (initial.editorMode === "admin") {
      const { uploadPlatformMinisiteMediaAction } = await import("@/features/admin/api");
      try {
        const formData = new FormData();
        const { compressImageToWebp } = await import("@/lib/minisite/compress-image.client");
        const blob = await compressImageToWebp(file);
        formData.append("file", new File([blob], "upload.webp", { type: "image/webp" }));
        const result = await uploadPlatformMinisiteMediaAction(initial.shopId, kind, formData);
        setUploading(null);
        if (!result.ok) {
          setError(result.message);
          return null;
        }
        return result.path;
      } catch (error) {
        setUploading(null);
        const detail = error instanceof Error ? error.message : "";
        setError(
          detail
            ? `Bild konnte nicht hochgeladen werden: ${detail}`
            : "Bild konnte nicht hochgeladen werden.",
        );
        return null;
      }
    }

    const result = await uploadShopMediaFile(initial.shopId, kind, file);
    setUploading(null);
    if (!result.ok) {
      setError(result.message);
      return null;
    }
    return result.path;
  }

  function applyUploadedPath(kind: ShopMediaKind, path: string) {
    if (kind === "logo") {
      setContent((current) => ({ ...current, logo_path: path }));
    } else if (kind === "cover") {
      setContent((current) => ({ ...current, cover_path: path }));
    } else if (kind === "hero_video") {
      setContent((current) => ({ ...current, cover_video_path: path }));
    } else {
      setContent((current) => {
        const gallery = [...(current.gallery ?? []), path].slice(0, 8);
        return { ...current, gallery };
      });
    }
    setToast(
      kind === "hero_video" ? "Video hochgeladen — bitte speichern." : "Bild hochgeladen — bitte speichern.",
    );
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveAction(draft);
      if (!result.ok) {
        const message =
          result.code === "MANAGED"
            ? "Diese Website wird von Glanzo verwaltet."
            : result.code === "VALIDATION"
              ? "Inhalt ungültig — bitte Felder prüfen und erneut speichern."
              : "Speichern fehlgeschlagen.";
        setError(message);
        return;
      }
      setToast("Live.");
    });
  }

  const isAdmin = initial.editorMode === "admin";
  const pageHeader = header ?? {
    kicker: "Public site",
    title: "Minisite",
    subtitle: "Vorschau live · Speichern = sofort live",
  };
  const canPickTemplate = isAdmin || initial.allowedTemplates.length > 1;

  const formPane = (
    <MinisiteSectionsPanel
      shopName={initial.publicData.shop.name}
      shopSlug={initial.shopSlug}
      template={template}
      allowedTemplates={initial.allowedTemplates}
      accentHex={accentHex}
      content={content}
      draft={draft}
      uploading={uploading}
      onAccentChange={setAccentHex}
      onTemplateChange={canPickTemplate ? setTemplate : undefined}
      onContentChange={setContent}
      onUpload={(kind, file) => void handleUpload(kind, file)}
      onSectionImageUpload={(target, file) => void handleSectionImageUpload(target, file)}
    />
  );

  return (
    <DashboardPage width="full" className="salon-dash-minisite-page">
      {backHref ? (
        <div className="mb-[var(--space-4)]">
          <Link
            href={backHref}
            className="text-sm text-[var(--text-2)] transition-colors hover:text-[var(--brass)]"
          >
            ← Zurück
          </Link>
        </div>
      ) : null}
      <DashboardPageHeader
        kicker={pageHeader.kicker}
        title={pageHeader.title}
        subtitle={pageHeader.subtitle}
      />

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

      <div className="salon-dash-minisite-editor">
        <div
          className={
            mobileTab === "preview" ? "hidden lg:flex" : "salon-dash-minisite-editor__form min-w-0"
          }
        >
          <div className="salon-dash-minisite-editor__form-body">{formPane}</div>
          <div className="salon-dash-minisite-form-actions">
            <DashboardPrimaryButton
              type="button"
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={save}
            >
              {isPending ? "Speichert…" : isAdmin ? "Website veröffentlichen" : "Alles speichern"}
            </DashboardPrimaryButton>
            <Button type="button" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href={viewSiteUrl} target="_blank" rel="noopener noreferrer">
                Seite ansehen
              </Link>
            </Button>
          </div>
          {error ? <p className="mt-[var(--space-2)] text-sm text-destructive">{error}</p> : null}
        </div>
        <aside
          className={`salon-dash-minisite-editor__preview ${mobileTab === "form" ? "hidden lg:flex" : ""}`}
          aria-label="Live preview"
        >
          <div className="salon-dash-minisite-preview-dock">
            <p className="salon-dash-kicker shrink-0 text-[10px]">Mobile preview · 375px</p>
            <div className="salon-dash-minisite-preview-frame mt-[var(--space-3)] min-h-0 flex-1">
              {PreviewPane ? (
                <PreviewPane shopSlug={initial.shopSlug} publicData={initial.publicData} draft={draft} />
              ) : (
                <p className="text-sm text-[var(--text-2)]">Vorschau lädt…</p>
              )}
            </div>
          </div>
        </aside>
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
    </DashboardPage>
  );
}
