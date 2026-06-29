"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { moveNavLink } from "@/lib/minisite/about-blocks";
import {
  VELVET_SECTION_META,
  collectVelvetMediaPool,
  moveVelvetSectionOrder,
  patchVelvetSectionBlock,
  resolveVelvetHomeSectionOrder,
  setVelvetSectionVisible,
  type VelvetHomeSectionKey,
} from "@/lib/minisite/velvet-sections";
import type { ShopMediaKind } from "@/lib/validations/minisite-editor";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../lib/media-url";
import { MinisiteEditorSection } from "../minisite-editor-section.client";
import { MultiImagePicker, SingleImagePicker } from "../minisite-image-pickers.client";

type VelvetMinisitePanelProps = {
  shopName: string;
  content: MinisiteContent;
  uploading: string | null;
  onContentChange: (content: MinisiteContent) => void;
  onUpload: (kind: ShopMediaKind, file: File) => void;
  onSectionImageUpload?: (
    target: {
      section: VelvetHomeSectionKey;
      field: "image_path" | "image_paths";
      index?: number;
    },
    file: File,
  ) => void;
  navLinks: Array<{ id: string; label: string; href?: string; visible?: boolean }>;
  saveNavLinks: (links: VelvetMinisitePanelProps["navLinks"]) => void;
  navHrefPresets: Array<{ label: string; value: string }>;
  defaultNavHref: string;
};

type TextField = "eyebrow" | "title" | "subtitle" | "text" | "cta_label" | "badge_tiny" | "badge_medium" | "badge_large";

function VelvetSectionTextFields({
  sectionKey,
  content,
  onContentChange,
  fields,
}: {
  sectionKey: VelvetHomeSectionKey;
  content: MinisiteContent;
  onContentChange: (content: MinisiteContent) => void;
  fields: TextField[];
}) {
  const meta = VELVET_SECTION_META[sectionKey];
  const block = content.sections?.[sectionKey] ?? {};

  function patch(field: TextField, value: string) {
    onContentChange(patchVelvetSectionBlock(content, sectionKey, { [field]: value || undefined }));
  }

  const labels: Record<TextField, string> = {
    eyebrow: "Eyebrow",
    title: "Überschrift",
    subtitle: "Untertitel (optional, | für Zeilenumbruch)",
    text: "Text",
    cta_label: "Button-Text",
    badge_tiny: "Badge 1",
    badge_medium: "Badge 2",
    badge_large: "Badge 3",
  };

  return (
    <div className="space-y-[var(--space-3)]">
      {fields.map((field) => (
        <div key={field}>
          <Label htmlFor={`velvet-${sectionKey}-${field}`}>{labels[field]}</Label>
          {field === "text" ? (
            <textarea
              id={`velvet-${sectionKey}-${field}`}
              rows={3}
              className="salon-dash-search mt-[var(--space-1)] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm"
              placeholder={(meta.defaults as Record<string, string | undefined>)[field] ?? ""}
              value={(block as Record<string, string | undefined>)[field] ?? ""}
              onChange={(e) => patch(field, e.target.value)}
            />
          ) : (
            <Input
              id={`velvet-${sectionKey}-${field}`}
              className="salon-dash-search mt-[var(--space-1)]"
              placeholder={(meta.defaults as Record<string, string | undefined>)[field] ?? ""}
              value={(block as Record<string, string | undefined>)[field] ?? ""}
              onChange={(e) => patch(field, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function VelvetMinisitePanel({
  shopName,
  content,
  uploading,
  onContentChange,
  onUpload,
  onSectionImageUpload,
  navLinks,
  saveNavLinks,
  navHrefPresets,
  defaultNavHref,
}: VelvetMinisitePanelProps) {
  const sectionOrder = resolveVelvetHomeSectionOrder(content);
  const mediaPool = collectVelvetMediaPool(content);
  const galleryPaths = content.sections?.gallery?.image_paths?.length
    ? content.sections.gallery.image_paths
    : (content.gallery ?? []);

  function patchSectionImages(paths: string[]) {
    const sections = { ...(content.sections ?? {}) };
    sections.gallery = { ...(sections.gallery ?? {}), image_paths: paths.length ? paths : undefined };
    onContentChange({ ...content, sections });
  }

  function patchSectionImagePath(
    section: VelvetHomeSectionKey,
    field: "image_path" | "image_paths",
    path: string,
    index?: number,
  ) {
    const sections = { ...(content.sections ?? {}) } as NonNullable<MinisiteContent["sections"]>;
    const block = { ...(sections[section] ?? {}) };
    if (field === "image_path") {
      sections[section] = { ...block, image_path: path };
    } else {
      const paths = [...(block.image_paths ?? [])];
      if (index !== undefined) {
        paths[index] = path;
      } else {
        paths.push(path);
      }
      sections[section] = { ...block, image_paths: paths.filter(Boolean).slice(0, 8) };
    }
    onContentChange({ ...content, sections });
  }

  function clearSectionImage(section: VelvetHomeSectionKey) {
    const sections = { ...(content.sections ?? {}) } as NonNullable<MinisiteContent["sections"]>;
    const block = { ...(sections[section] ?? {}) };
    const { image_path: _removed, ...rest } = block;
    sections[section] = rest;
    onContentChange({ ...content, sections });
  }

  return (
    <>
      <MinisiteEditorSection
        id="velvet-sections"
        title="Velvet — Abschnitte"
        description="Reihenfolge und Sichtbarkeit aller Bereiche der Startseite."
        defaultOpen
      >
        <ul className="space-y-[var(--space-1)]">
          {sectionOrder.map((key, index) => {
            const meta = VELVET_SECTION_META[key];
            const enabled = content.show?.[meta.showKey] !== false;
            return (
              <li
                key={key}
                className="flex items-center gap-[var(--space-2)] rounded border border-[var(--ink-3)] bg-[var(--ink-1)] px-[var(--space-3)] py-[var(--space-2)]"
              >
                <span className="min-w-0 flex-1 text-sm font-medium">{meta.label}</span>
                <label className="flex cursor-pointer items-center gap-1 text-xs text-[var(--text-2)]">
                  <input
                    type="checkbox"
                    className="salon-dash-toggle size-4"
                    checked={enabled}
                    onChange={(e) => onContentChange(setVelvetSectionVisible(content, key, e.target.checked))}
                  />
                  An
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1"
                  disabled={index === 0}
                  onClick={() => onContentChange(moveVelvetSectionOrder(content, index, -1))}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1"
                  disabled={index === sectionOrder.length - 1}
                  onClick={() => onContentChange(moveVelvetSectionOrder(content, index, 1))}
                >
                  ↓
                </Button>
              </li>
            );
          })}
        </ul>
      </MinisiteEditorSection>

      <MinisiteEditorSection
        id="velvet-nav"
        title="Navigation"
        description="Menü oben auf der Seite — Links zu den Abschnitten."
      >
        <ul className="space-y-[var(--space-2)]">
          {navLinks.map((link, index) => (
            <li key={link.id} className="rounded-md border border-[var(--ink-3)] p-[var(--space-3)]">
              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                <Input
                  value={link.label}
                  className="salon-dash-search min-w-[8rem] flex-1"
                  onChange={(e) => {
                    const next = [...navLinks];
                    next[index] = { ...link, label: e.target.value };
                    saveNavLinks(next);
                  }}
                />
                <select
                  className="salon-dash-search min-w-[10rem] px-[var(--space-2)] py-[var(--space-2)] text-sm"
                  value={link.href ?? defaultNavHref}
                  onChange={(e) => {
                    const next = [...navLinks];
                    next[index] = { ...link, href: e.target.value };
                    saveNavLinks(next);
                  }}
                >
                  {navHrefPresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 text-xs text-[var(--text-2)]">
                  <input
                    type="checkbox"
                    checked={link.visible !== false}
                    onChange={(e) => {
                      const next = [...navLinks];
                      next[index] = { ...link, visible: e.target.checked };
                      saveNavLinks(next);
                    }}
                  />
                  An
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() => saveNavLinks(moveNavLink(navLinks, index, -1))}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={index === navLinks.length - 1}
                  onClick={() => saveNavLinks(moveNavLink(navLinks, index, 1))}
                >
                  ↓
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </MinisiteEditorSection>

      <MinisiteEditorSection
        id="velvet-hero"
        title="Hero"
        description="Vollbild oben — Video oder Bilder, Überschrift und Buchungs-Button."
        defaultOpen
      >
        <div className="space-y-[var(--space-4)]">
          <VelvetSectionTextFields
            sectionKey="hero"
            content={content}
            onContentChange={onContentChange}
            fields={["eyebrow", "title", "subtitle", "text", "cta_label"]}
          />
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
            <SingleImagePicker
              label="Logo"
              path={content.logo_path}
              gallery={mediaPool}
              uploading={uploading === "logo"}
              onUpload={(file) => onUpload("logo", file)}
              onPick={(path) => onContentChange({ ...content, logo_path: path })}
              onClear={() => onContentChange({ ...content, logo_path: undefined })}
            />
            <SingleImagePicker
              label="Cover (Fallback / Poster)"
              hint="Wird genutzt wenn kein Video — oder als Video-Poster."
              path={content.cover_path}
              gallery={mediaPool}
              uploading={uploading === "cover"}
              onUpload={(file) => onUpload("cover", file)}
              onPick={(path) => onContentChange({ ...content, cover_path: path })}
              onClear={() => onContentChange({ ...content, cover_path: undefined })}
            />
          </div>
          <div className="space-y-[var(--space-2)]">
            <Label>Hero-Video (Hintergrund)</Label>
            <p className="text-xs text-[var(--text-3)]">
              MP4 oder WebM, max. 20 MB. Ersetzt die Bild-Slideshow.
            </p>
            {content.cover_video_path ? (
              <div className="space-y-[var(--space-2)]">
                <video
                  src={shopMediaPublicUrl(content.cover_video_path)}
                  className="h-28 w-full rounded object-cover"
                  muted
                  playsInline
                  controls
                  preload="metadata"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onContentChange({ ...content, cover_video_path: undefined })}
                >
                  Video entfernen
                </Button>
              </div>
            ) : null}
            <label className="cursor-pointer text-sm text-[var(--brass)]">
              {uploading === "hero_video" ? "Lädt…" : "+ Hero-Video hochladen"}
              <input
                type="file"
                accept="video/mp4,video/webm"
                className="sr-only"
                disabled={uploading === "hero_video"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload("hero_video", file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p className="text-xs text-[var(--text-3)]">
            Salon-Name „{shopName}“ wird verwendet wenn die Hero-Überschrift leer ist.
          </p>
        </div>
      </MinisiteEditorSection>

      <MinisiteEditorSection
        id="velvet-about"
        title="Über die Künstlerin"
        description="Profil links, großes Foto rechts mit Badge."
      >
        <div className="space-y-[var(--space-4)]">
          <VelvetSectionTextFields
            sectionKey="about"
            content={content}
            onContentChange={onContentChange}
            fields={["eyebrow", "title", "subtitle", "text", "cta_label", "badge_tiny", "badge_medium", "badge_large"]}
          />
          <SingleImagePicker
            label="Künstlerinnen-Foto"
            hint="Großes Portrait rechts im About-Bereich."
            path={content.sections?.about?.image_path}
            gallery={mediaPool}
            uploading={uploading === "section-about"}
            onUpload={(file) => onSectionImageUpload?.({ section: "about", field: "image_path" }, file)}
            onPick={(path) => patchSectionImagePath("about", "image_path", path)}
            onClear={() => clearSectionImage("about")}
          />
        </div>
      </MinisiteEditorSection>

      <MinisiteEditorSection
        id="velvet-services"
        title="Leistungen"
        description="Menü mit Preisen — Leistungen selbst im Tab „Leistungen“ pflegen."
      >
        <div className="space-y-[var(--space-4)]">
          <VelvetSectionTextFields
            sectionKey="services"
            content={content}
            onContentChange={onContentChange}
            fields={["eyebrow", "title", "cta_label"]}
          />
          <SingleImagePicker
            label="Feature-Bild (links)"
            hint="Großes Foto neben der Preisliste."
            path={content.sections?.services?.image_path}
            gallery={mediaPool}
            uploading={uploading === "section-services"}
            onUpload={(file) => onSectionImageUpload?.({ section: "services", field: "image_path" }, file)}
            onPick={(path) => patchSectionImagePath("services", "image_path", path)}
            onClear={() => clearSectionImage("services")}
          />
        </div>
      </MinisiteEditorSection>

      <MinisiteEditorSection
        id="velvet-gallery"
        title="Galerie — The Work"
        description="Masonry-Grid mit bis zu 8 Nail-Art Fotos."
      >
        <div className="space-y-[var(--space-4)]">
          <VelvetSectionTextFields
            sectionKey="gallery"
            content={content}
            onContentChange={onContentChange}
            fields={["eyebrow", "title"]}
          />
          <MultiImagePicker
            label="Galerie-Fotos"
            paths={galleryPaths}
            max={8}
            gallery={mediaPool}
            uploading={uploading === "section-gallery"}
            onUpload={(file) => onSectionImageUpload?.({ section: "gallery", field: "image_paths" }, file)}
            onChange={patchSectionImages}
          />
        </div>
      </MinisiteEditorSection>

      <MinisiteEditorSection
        id="velvet-social"
        title="Social"
        description="Instagram-Bereich — nutzt dieselben Galerie-Fotos als Streifen."
      >
        <div className="space-y-[var(--space-4)]">
          <VelvetSectionTextFields
            sectionKey="social"
            content={content}
            onContentChange={onContentChange}
            fields={["eyebrow", "title", "cta_label"]}
          />
          <div>
            <Label htmlFor="velvet-instagram">Instagram</Label>
            <Input
              id="velvet-instagram"
              className="salon-dash-search mt-[var(--space-1)]"
              placeholder="@salonname"
              value={content.links?.instagram ?? content.instagram ?? ""}
              onChange={(e) =>
                onContentChange({
                  ...content,
                  instagram: e.target.value || undefined,
                  links: { ...(content.links ?? {}), instagram: e.target.value || undefined },
                })
              }
            />
          </div>
          <p className="text-xs text-[var(--text-3)]">
            Die Foto-Streifen zeigen die Bilder aus dem Galerie-Abschnitt oben.
          </p>
        </div>
      </MinisiteEditorSection>

      <MinisiteEditorSection
        id="velvet-contact"
        title="Kontakt & Öffnungszeiten"
        description="Adresse, Telefon und Abschnitts-Überschriften."
      >
        <div className="space-y-[var(--space-4)]">
          <VelvetSectionTextFields
            sectionKey="contact"
            content={content}
            onContentChange={onContentChange}
            fields={["eyebrow", "title"]}
          />
          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
            <div>
              <Label htmlFor="velvet-address">Adresse</Label>
              <Input
                id="velvet-address"
                className="salon-dash-search mt-[var(--space-1)]"
                value={content.address ?? ""}
                onChange={(e) => onContentChange({ ...content, address: e.target.value || undefined })}
              />
            </div>
            <div>
              <Label htmlFor="velvet-phone">Telefon</Label>
              <Input
                id="velvet-phone"
                className="salon-dash-search mt-[var(--space-1)]"
                value={content.phone ?? ""}
                onChange={(e) => onContentChange({ ...content, phone: e.target.value || undefined })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="velvet-email">E-Mail</Label>
              <Input
                id="velvet-email"
                className="salon-dash-search mt-[var(--space-1)]"
                value={content.email ?? ""}
                onChange={(e) => onContentChange({ ...content, email: e.target.value || undefined })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="velvet-booking-notice">Buchungs-Hinweis</Label>
            <Input
              id="velvet-booking-notice"
              className="salon-dash-search mt-[var(--space-1)]"
              value={content.booking_notice ?? ""}
              onChange={(e) => onContentChange({ ...content, booking_notice: e.target.value || undefined })}
            />
          </div>
        </div>
      </MinisiteEditorSection>
    </>
  );
}
