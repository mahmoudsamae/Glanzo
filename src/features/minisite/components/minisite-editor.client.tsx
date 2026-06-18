"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  DashboardPage,
  DashboardPageHeader,
  DashboardPrimaryButton,
} from "@/features/dashboard";
import { Button } from "@/components/ui/button";
import { buildShopMinisiteUrl } from "@/lib/dashboard/minisite-url";
import type { MinisiteSaveInput } from "@/lib/validations/minisite-editor";
import type { MinisiteContent } from "@/lib/validations/public-shop";
import type { MinisiteEditorData } from "@/lib/minisite/editor-types";

import { saveMinisiteAction } from "../api";
import { MinisiteSectionsPanel } from "./minisite-sections-panel.client";

import type { MinisitePreviewPane as MinisitePreviewPaneType } from "./minisite-preview-pane.client";

type PreviewComponent = typeof MinisitePreviewPaneType;

type MinisiteEditorProps = {
  initial: MinisiteEditorData;
};

type MobileTab = "form" | "preview";

export function MinisiteEditor({ initial }: MinisiteEditorProps) {
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
      setContent((current) => ({ ...current, logo_path: result.path }));
    } else if (kind === "cover") {
      setContent((current) => ({ ...current, cover_path: result.path }));
    } else {
      setContent((current) => {
        const gallery = [...(current.gallery ?? []), result.path].slice(0, 8);
        return { ...current, gallery };
      });
    }
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
      onTemplateChange={initial.allowedTemplates.length > 1 ? setTemplate : undefined}
      onContentChange={setContent}
      onUpload={(kind, file) => void handleUpload(kind, file)}
    />
  );

  return (
    <DashboardPage width="full" className="salon-dash-minisite-page">
      <DashboardPageHeader
        kicker="Public site"
        title="Minisite"
        subtitle="Vorschau live · Speichern = sofort live"
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
              {isPending ? "Speichert…" : "Alles speichern"}
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
