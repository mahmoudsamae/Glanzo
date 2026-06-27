"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ABOUT_BLOCK_TYPE_LABELS,
  ABOUT_BLOCK_TYPES,
  moveAboutBlock,
  removeAboutBlock,
  type AboutBlock,
  type AboutBlockType,
} from "@/lib/minisite/about-blocks";
import {
  NICOLES_SECTION_META,
  editableNicolesNewsItem,
  patchNicolesNewsItem,
  resolveNicolesHomeSectionOrder,
  type NicolesHomeSectionKey,
} from "@/lib/minisite/nicoles-sections";
import {
  createForgePriceSection,
  resolveForgeExtraPriceSections,
} from "@/lib/minisite/forge-prices-page";
import {
  formatPriceRows,
  parsePriceRows,
} from "@/lib/minisite/nicoles-prices-page";
import { DEFAULT_KONTAKT_MAP_DIRECTIONS } from "@/lib/minisite/nicoles-kontakt-page";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../lib/media-url";
import { MinisiteEditorSection } from "../minisite-editor-section.client";
import { MultiImagePicker, SingleImagePicker } from "../minisite-image-pickers.client";

type ForgeMinisitePanelProps = {
  shopName: string;
  content: MinisiteContent;
  gallery: string[];
  uploading: string | null;
  onContentChange: (content: MinisiteContent) => void;
  onUpload: (kind: "logo" | "cover" | "gallery", file: File) => void;
  onSectionImageUpload?: (
    target: {
      section: NicolesHomeSectionKey | "prices" | "contact" | "news";
      field: "image_path" | "image_paths";
      index?: number;
    },
    file: File,
  ) => void;
  navLinks: Array<{ id: string; label: string; href?: string; visible?: boolean }>;
  saveNavLinks: (links: ForgeMinisitePanelProps["navLinks"]) => void;
  navHrefPresets: Array<{ label: string; value: string }>;
  defaultNavHref: string;
  blocks: AboutBlock[];
  openBlockId: string | null;
  setOpenBlockId: (id: string | null) => void;
  saveBlocks: (blocks: AboutBlock[]) => void;
  addBlock: (type: AboutBlockType) => void;
  aboutBlockFields: (block: AboutBlock) => ReactNode;
};

function patchSection(
  content: MinisiteContent,
  key: NicolesHomeSectionKey,
  patch: Record<string, string | undefined>,
): MinisiteContent {
  const sections = { ...(content.sections ?? {}) };
  sections[key] = { ...(sections[key] ?? {}), ...patch };
  return { ...content, sections };
}

function patchSectionImagePath(
  content: MinisiteContent,
  section: NicolesHomeSectionKey | "prices" | "contact",
  field: "image_path" | "image_paths",
  path: string,
  index?: number,
): MinisiteContent {
  const sections = { ...(content.sections ?? {}) };
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

  return { ...content, sections };
}

function setSectionVisible(content: MinisiteContent, key: NicolesHomeSectionKey, visible: boolean): MinisiteContent {
  const meta = NICOLES_SECTION_META[key];
  return { ...content, show: { ...(content.show ?? {}), [meta.showKey]: visible } };
}

function moveSectionOrder(content: MinisiteContent, index: number, direction: -1 | 1): MinisiteContent {
  const order = resolveNicolesHomeSectionOrder(content);
  const target = index + direction;
  if (target < 0 || target >= order.length) return content;
  const next = [...order];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return { ...content, section_order: next };
}

function ForgeFieldInput({
  label,
  id,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className="salon-dash-search mt-[var(--space-1)]"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ForgeFieldTextArea({
  label,
  id,
  value,
  rows,
  hint,
  placeholder,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  rows: number;
  hint?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        className="salon-dash-search mt-[var(--space-1)] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="mt-1 text-xs text-[var(--text-3)]">{hint}</p> : null}
    </div>
  );
}

function ForgeSectionTextFields({
  sectionKey,
  content,
  onContentChange,
}: {
  sectionKey: NicolesHomeSectionKey;
  content: MinisiteContent;
  onContentChange: (c: MinisiteContent) => void;
}) {
  const meta = NICOLES_SECTION_META[sectionKey];
  const block = content.sections?.[sectionKey] ?? {};
  const hasText = sectionKey !== "hero" && sectionKey !== "salon_banner";
  const hasCta = sectionKey === "about" || sectionKey === "services";
  const hasBadge = sectionKey === "hero";

  function patch(field: string, value: string) {
    onContentChange(patchSection(content, sectionKey, { [field]: value || undefined }));
  }

  return (
    <div className="space-y-[var(--space-3)]">
      {"eyebrow" in meta.defaults ? (
        <ForgeFieldInput
          label="Kleine Überschrift"
          id={`forge-${sectionKey}-eyebrow`}
          placeholder={meta.defaults.eyebrow ?? ""}
          value={block.eyebrow ?? ""}
          onChange={(v) => patch("eyebrow", v)}
        />
      ) : null}
      <ForgeFieldInput
        label="Überschrift"
        id={`forge-${sectionKey}-title`}
        placeholder={meta.defaults.title ?? ""}
        value={block.title ?? ""}
        onChange={(v) => patch("title", v)}
      />
      {hasText ? (
        <ForgeFieldTextArea
          label="Text"
          id={`forge-${sectionKey}-text`}
          rows={sectionKey === "aktionstage" ? 4 : 3}
          placeholder={meta.defaults.text ?? ""}
          value={block.text ?? ""}
          hint={sectionKey === "aktionstage" ? "Format: Tag|Angebot — eine Zeile pro Aktionstag." : undefined}
          onChange={(v) => patch("text", v)}
        />
      ) : null}
      {hasCta ? (
        <ForgeFieldInput
          label="Button-Text"
          id={`forge-${sectionKey}-cta`}
          placeholder={meta.defaults.cta_label ?? ""}
          value={block.cta_label ?? ""}
          onChange={(v) => patch("cta_label", v)}
        />
      ) : null}
      {hasBadge ? (
        <>
          <ForgeFieldInput label="Badge Zeile 1" id="forge-badge-tiny" value={block.badge_tiny ?? ""} onChange={(v) => patch("badge_tiny", v)} />
          <ForgeFieldInput label="Badge Zeile 2" id="forge-badge-medium" value={block.badge_medium ?? ""} onChange={(v) => patch("badge_medium", v)} />
          <ForgeFieldInput label="Badge Zeile 3" id="forge-badge-large" value={block.badge_large ?? ""} onChange={(v) => patch("badge_large", v)} />
        </>
      ) : null}
    </div>
  );
}

export function ForgeMinisitePanel({
  shopName,
  content,
  gallery,
  uploading,
  onContentChange,
  onUpload,
  onSectionImageUpload,
  navLinks,
  saveNavLinks,
  navHrefPresets,
  defaultNavHref,
  blocks,
  openBlockId,
  setOpenBlockId,
  saveBlocks,
  addBlock,
  aboutBlockFields,
}: ForgeMinisitePanelProps) {
  const fullOrder = resolveNicolesHomeSectionOrder(content).filter((key) => key !== "team");
  const priceSections = resolveForgeExtraPriceSections(content);

  function savePriceSections(next: typeof priceSections) {
    onContentChange({ ...content, nicoles_price_sections: next });
  }

  function uploadSection(
    target: {
      section: NicolesHomeSectionKey | "prices" | "contact" | "news";
      field: "image_path" | "image_paths";
      index?: number;
    },
    file: File,
  ) {
    if (onSectionImageUpload) {
      onSectionImageUpload(target, file);
      return;
    }
    onUpload("gallery", file);
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      {/* Navigation */}
      <MinisiteEditorSection id="forge-nav" title="Navigation" description="Menü oben auf der Website.">
        <div className="mb-[var(--space-4)]">
          <Label htmlFor="forge-nav-tagline">Nav-Tagline</Label>
          <Input
            id="forge-nav-tagline"
            className="salon-dash-search mt-[var(--space-2)]"
            placeholder="friseur- & barbershop"
            value={content.sections?.nav?.text ?? ""}
            onChange={(e) =>
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  nav: { ...(content.sections?.nav ?? {}), text: e.target.value || undefined },
                },
              })
            }
          />
        </div>
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
              </div>
            </li>
          ))}
        </ul>
      </MinisiteEditorSection>

      {/* Home */}
      <MinisiteEditorSection
        id="forge-home"
        title="Startseite (Home)"
        description="Alle Abschnitte der Startseite — aufklappen und bearbeiten."
        defaultOpen
      >
        <div className="flex flex-col gap-[var(--space-2)]">
          {/* Hero */}
          <MinisiteEditorSection id="forge-home-hero" title="Hero" description="Logo, Überschrift, Foto rechts und Deal-Badge.">
            <div className="space-y-[var(--space-4)]">
              <ForgeFieldInput
                label="Überschrift"
                id="forge-hero-headline"
                placeholder={shopName}
                value={content.hero_headline ?? ""}
                onChange={(v) => onContentChange({ ...content, hero_headline: v || undefined })}
              />
              <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
                <div className="space-y-[var(--space-2)]">
                  <Label>Logo</Label>
                  {content.logo_path ? (
                    <div className="flex items-center gap-[var(--space-2)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={shopMediaPublicUrl(content.logo_path)} alt="" className="h-12 rounded object-contain" />
                      <Button type="button" size="sm" variant="ghost" onClick={() => onContentChange({ ...content, logo_path: undefined })}>
                        Entfernen
                      </Button>
                    </div>
                  ) : null}
                  <label className="cursor-pointer text-sm text-[var(--brass)]">
                    {uploading === "logo" ? "Lädt…" : "+ Logo hochladen"}
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="sr-only" disabled={uploading === "logo"} onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload("logo", f); e.target.value = ""; }} />
                  </label>
                </div>
                <SingleImagePicker
                  label="Foto rechts (Titelbild)"
                  path={content.cover_path}
                  gallery={gallery}
                  uploading={uploading === "cover"}
                  onUpload={(file) => onUpload("cover", file)}
                  onPick={(path) => onContentChange({ ...content, cover_path: path })}
                  onClear={() => onContentChange({ ...content, cover_path: undefined })}
                />
              </div>
              <SingleImagePicker
                label="Alternatives Hero-Foto (optional)"
                path={content.sections?.hero?.image_paths?.[0]}
                gallery={gallery}
                uploading={uploading === "section-hero" || uploading === "gallery"}
                onUpload={(file) => uploadSection({ section: "hero", field: "image_paths", index: 0 }, file)}
                onPick={(path) => onContentChange(patchSectionImagePath(content, "hero", "image_paths", path, 0))}
                onClear={() => {
                  const paths = (content.sections?.hero?.image_paths ?? []).slice(1);
                  onContentChange({
                    ...content,
                    sections: {
                      ...(content.sections ?? {}),
                      hero: { ...(content.sections?.hero ?? {}), image_paths: paths.length ? paths : undefined },
                    },
                  });
                }}
              />
              <ForgeSectionTextFields sectionKey="hero" content={content} onContentChange={onContentChange} />
            </div>
          </MinisiteEditorSection>

          {/* About preview */}
          <MinisiteEditorSection
            id="forge-home-about"
            title="Über uns Vorschau"
            description="Text und Fotos links — Button „Mehr über uns“ führt zur Über-uns-Seite."
          >
            <div className="space-y-[var(--space-4)]">
              <ForgeSectionTextFields sectionKey="about" content={content} onContentChange={onContentChange} />
              <MultiImagePicker
                label="Fotos rechts"
                paths={content.sections?.about?.image_paths ?? []}
                max={2}
                gallery={gallery}
                uploading={uploading === "section-about" || uploading === "gallery"}
                onUpload={(file) => uploadSection({ section: "about", field: "image_paths" }, file)}
                onChange={(paths) =>
                  onContentChange({
                    ...content,
                    sections: {
                      ...(content.sections ?? {}),
                      about: { ...(content.sections?.about ?? {}), image_paths: paths.length ? paths : undefined },
                    },
                  })
                }
              />
              <p className="text-xs text-[var(--text-3)]">Der Button verlinkt automatisch auf /about.</p>
            </div>
          </MinisiteEditorSection>

          {/* Salon banner */}
          <MinisiteEditorSection id="forge-home-salon" title="Salon-Banner" description="Großes Zitat mit Hintergrundbild.">
            <div className="space-y-[var(--space-4)]">
              <ForgeSectionTextFields sectionKey="salon_banner" content={content} onContentChange={onContentChange} />
              <SingleImagePicker
                label="Hintergrundbild"
                path={content.sections?.salon_banner?.image_path}
                gallery={gallery}
                uploading={uploading === "section-salon_banner" || uploading === "gallery"}
                onUpload={(file) => uploadSection({ section: "salon_banner", field: "image_path" }, file)}
                onPick={(path) => onContentChange(patchSectionImagePath(content, "salon_banner", "image_path", path))}
                onClear={() =>
                  onContentChange({
                    ...content,
                    sections: {
                      ...(content.sections ?? {}),
                      salon_banner: { ...(content.sections?.salon_banner ?? {}), image_path: undefined },
                    },
                  })
                }
              />
            </div>
          </MinisiteEditorSection>

          {/* Services preview */}
          <MinisiteEditorSection
            id="forge-home-services"
            title="Leistungen Vorschau"
            description="Überschrift und Text — Karten kommen aus dem Dashboard-Katalog."
          >
            <div className="space-y-[var(--space-3)]">
              <ForgeSectionTextFields sectionKey="services" content={content} onContentChange={onContentChange} />
              <p className="text-xs text-[var(--text-2)]">
                Service-Fotos und Preise: Dashboard → Leistungen. Button führt zu /leistungen.
              </p>
            </div>
          </MinisiteEditorSection>

          {/* Aktionstage */}
          <MinisiteEditorSection id="forge-home-aktionstage" title="Aktionstage" description="Promo-Band mit Wochenangeboten.">
            <ForgeSectionTextFields sectionKey="aktionstage" content={content} onContentChange={onContentChange} />
            <SingleImagePicker
              label="Hintergrundbild"
              path={content.sections?.aktionstage?.image_path}
              gallery={gallery}
              uploading={uploading === "gallery"}
              onUpload={(file) => uploadSection({ section: "aktionstage", field: "image_path" }, file)}
              onPick={(path) => onContentChange(patchSectionImagePath(content, "aktionstage", "image_path", path))}
              onClear={() =>
                onContentChange({
                  ...content,
                  sections: {
                    ...(content.sections ?? {}),
                    aktionstage: { ...(content.sections?.aktionstage ?? {}), image_path: undefined },
                  },
                })
              }
            />
          </MinisiteEditorSection>

          {/* News */}
          <MinisiteEditorSection id="forge-home-news" title="Aktuelles" description="News-Karten auf der Startseite.">
            <div className="space-y-[var(--space-4)]">
              <ForgeSectionTextFields sectionKey="news" content={content} onContentChange={onContentChange} />
              <div>
                <p className="mb-[var(--space-2)] text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">News-Karten (3)</p>
                <ul className="space-y-[var(--space-4)]">
                  {[0, 1, 2].map((index) => {
                    const item = editableNicolesNewsItem(content, index);
                    return (
                      <li
                        key={item.id}
                        className="space-y-[var(--space-3)] rounded-lg border border-[var(--ink-3)] p-[var(--space-3)]"
                      >
                        <ForgeFieldInput
                          label={`Karte ${index + 1} — Titel`}
                          id={`forge-news-${index}`}
                          value={content.nicoles_news?.[index]?.title ?? item.title}
                          onChange={(title) => {
                            onContentChange(patchNicolesNewsItem(content, index, { title }));
                          }}
                        />
                        <SingleImagePicker
                          label={`Karte ${index + 1} — Bild`}
                          path={content.nicoles_news?.[index]?.image_path ?? item.image_path}
                          gallery={gallery}
                          uploading={uploading === `news-${index}` || uploading === "gallery"}
                          onUpload={(file) =>
                            uploadSection({ section: "news", field: "image_path", index }, file)
                          }
                          onPick={(path) =>
                            onContentChange(patchNicolesNewsItem(content, index, { image_path: path }))
                          }
                          onClear={() =>
                            onContentChange(patchNicolesNewsItem(content, index, { image_path: undefined }))
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </MinisiteEditorSection>

          {/* Pre-footer */}
          <MinisiteEditorSection id="forge-home-prefooter" title="Pre-Footer" description="Logo zwischen zwei Fotos vor dem Footer.">
            <MultiImagePicker
              label="Fotos links & rechts"
              paths={content.sections?.pre_footer?.image_paths ?? []}
              max={2}
              gallery={gallery}
              uploading={uploading === "gallery"}
              onUpload={(file) => uploadSection({ section: "pre_footer", field: "image_paths" }, file)}
              onChange={(paths) =>
                onContentChange({
                  ...content,
                  sections: {
                    ...(content.sections ?? {}),
                    pre_footer: { ...(content.sections?.pre_footer ?? {}), image_paths: paths.length ? paths : undefined },
                  },
                })
              }
            />
          </MinisiteEditorSection>

          {/* Order */}
          <div className="rounded border border-[var(--ink-3)] p-[var(--space-3)]">
            <p className="mb-[var(--space-2)] text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
              Reihenfolge & Sichtbarkeit
            </p>
            <ul className="space-y-[var(--space-1)]">
              {fullOrder.map((key, index) => {
                const meta = NICOLES_SECTION_META[key];
                const enabled = content.show?.[meta.showKey] !== false;
                return (
                  <li key={key} className="flex items-center gap-[var(--space-2)] rounded border border-[var(--ink-3)] bg-[var(--ink-1)] px-[var(--space-3)] py-[var(--space-2)]">
                    <span className="min-w-0 flex-1 text-sm">{meta.label}</span>
                    <label className="flex cursor-pointer items-center gap-1 text-xs text-[var(--text-2)]">
                      <input type="checkbox" className="salon-dash-toggle size-4" checked={enabled} onChange={(e) => onContentChange(setSectionVisible(content, key, e.target.checked))} />
                      An
                    </label>
                    <Button type="button" size="sm" variant="ghost" className="h-6 px-1" disabled={index === 0} onClick={() => onContentChange(moveSectionOrder(content, index, -1))}>↑</Button>
                    <Button type="button" size="sm" variant="ghost" className="h-6 px-1" disabled={index === fullOrder.length - 1} onClick={() => onContentChange(moveSectionOrder(content, index, 1))}>↓</Button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </MinisiteEditorSection>

      {/* About page */}
      <MinisiteEditorSection
        id="forge-about-page"
        title="Über uns Seite"
        description="Inhalt für /about — Hero, Text und Team-Profile mit Foto."
      >
        <div className="space-y-[var(--space-4)]">
          <div className="flex flex-wrap gap-[var(--space-2)]">
            {ABOUT_BLOCK_TYPES.map((type) => (
              <Button key={type} type="button" size="sm" variant="outline" onClick={() => addBlock(type)}>
                + {ABOUT_BLOCK_TYPE_LABELS[type]}
              </Button>
            ))}
          </div>
          <ul className="space-y-[var(--space-2)]">
            {blocks.map((block, index) => (
              <li key={block.id} className="rounded-md border border-[var(--ink-3)] bg-[var(--ink-1)]">
                <div className="flex flex-wrap items-center gap-[var(--space-2)] px-[var(--space-3)] py-[var(--space-3)]">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-md">{ABOUT_BLOCK_TYPE_LABELS[block.type]}</p>
                    <p className="truncate text-xs text-[var(--text-2)]">{block.title || block.eyebrow || block.subtitle || "—"}</p>
                  </div>
                  <Button type="button" size="sm" variant="ghost" disabled={index === 0} onClick={() => saveBlocks(moveAboutBlock(blocks, index, -1))}>↑</Button>
                  <Button type="button" size="sm" variant="ghost" disabled={index === blocks.length - 1} onClick={() => saveBlocks(moveAboutBlock(blocks, index, 1))}>↓</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setOpenBlockId(openBlockId === block.id ? null : block.id)}>
                    {openBlockId === block.id ? "Schließen" : "Bearbeiten"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => saveBlocks(removeAboutBlock(blocks, block.id))}>×</Button>
                </div>
                {openBlockId === block.id ? aboutBlockFields(block) : null}
              </li>
            ))}
          </ul>
        </div>
      </MinisiteEditorSection>

      {/* Leistungen page */}
      <MinisiteEditorSection
        id="forge-leistungen-page"
        title="Leistungen & Preise"
        description="Inhalt für /leistungen — Hero, Katalog und Preisliste."
      >
        <div className="space-y-[var(--space-4)]">
          <ForgeFieldInput
            label="Seitentitel"
            id="forge-prices-title"
            value={content.sections?.prices?.title ?? "Leistungen & Preise"}
            onChange={(v) =>
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  prices: { ...(content.sections?.prices ?? {}), title: v || undefined },
                },
              })
            }
          />
          <ForgeFieldTextArea
            label="Kurzbeschreibung (auf dem Hero)"
            id="forge-prices-intro"
            rows={3}
            value={
              content.sections?.prices?.text ??
              "Präzise Schnitte und faire Preise — direkt aus unserem Leistungskatalog."
            }
            onChange={(v) =>
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  prices: { ...(content.sections?.prices ?? {}), text: v || undefined },
                },
              })
            }
          />
          <SingleImagePicker
            label="Hero-Bild"
            path={content.sections?.prices?.image_path}
            gallery={gallery}
            uploading={uploading === "section-prices" || uploading === "gallery"}
            onUpload={(file) => uploadSection({ section: "prices", field: "image_path" }, file)}
            onPick={(path) => onContentChange(patchSectionImagePath(content, "prices", "image_path", path))}
            onClear={() =>
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  prices: { ...(content.sections?.prices ?? {}), image_path: undefined },
                },
              })
            }
          />
          <SingleImagePicker
            label="Hintergrund Preisliste"
            path={content.sections?.prices?.image_paths?.[0]}
            gallery={gallery}
            uploading={uploading === "section-prices-list-bg" || uploading === "gallery"}
            onUpload={(file) => uploadSection({ section: "prices", field: "image_paths", index: 0 }, file)}
            onPick={(path) => onContentChange(patchSectionImagePath(content, "prices", "image_paths", path, 0))}
            onClear={() => {
              const paths = [...(content.sections?.prices?.image_paths ?? [])];
              paths[0] = "";
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  prices: {
                    ...(content.sections?.prices ?? {}),
                    image_paths: paths.filter(Boolean).length ? paths.filter(Boolean) : undefined,
                  },
                },
              });
            }}
          />

          <div className="rounded border border-[var(--ink-3)] bg-[var(--ink-1)] p-[var(--space-3)]">
            <p className="text-sm font-medium text-[var(--text-1)]">Leistungen aus dem Katalog</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-2)]">
              Die Karten oben und der Block «Leistungen» in der Preisliste kommen automatisch aus Dashboard →
              Leistungen. Änderst du dort Name oder Preis, aktualisiert sich die Seite sofort — ohne erneutes
              Speichern hier.
            </p>
            <ForgeFieldInput
              label="Katalog-Titel in der Preisliste"
              id="forge-prices-catalog-title"
              value={content.sections?.prices?.eyebrow ?? "LEISTUNGEN"}
              onChange={(v) =>
                onContentChange({
                  ...content,
                  sections: {
                    ...(content.sections ?? {}),
                    prices: { ...(content.sections?.prices ?? {}), eyebrow: v || undefined },
                  },
                })
              }
            />
          </div>

          <div>
            <div className="mb-[var(--space-2)] flex flex-wrap items-center justify-between gap-[var(--space-2)]">
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
                Zusätzliche Preiskategorien
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => savePriceSections([...priceSections, createForgePriceSection()])}
              >
                + Kategorie
              </Button>
            </div>
            <p className="mb-[var(--space-3)] text-xs text-[var(--text-3)]">
              Für Einträge ohne eigene buchbare Leistung — z. B. Kinderpreise. Format: Leistung|Preis pro Zeile.
            </p>
            {priceSections.length === 0 ? (
              <p className="rounded border border-dashed border-[var(--ink-3)] px-[var(--space-3)] py-[var(--space-4)] text-xs text-[var(--text-3)]">
                Noch keine Zusatz-Kategorien. Beispiel: «KINDER» mit «0–3 Jahre|10 €».
              </p>
            ) : null}
            <ul className="space-y-[var(--space-3)]">
              {priceSections.map((section, sectionIndex) => (
                <li key={section.id} className="rounded border border-[var(--ink-3)] p-[var(--space-3)]">
                  <div className="mb-[var(--space-2)] flex items-start justify-between gap-[var(--space-2)]">
                    <ForgeFieldInput
                      label="Kategorie"
                      id={`forge-price-cat-${section.id}`}
                      value={section.title}
                      onChange={(title) => {
                        const next = [...priceSections];
                        next[sectionIndex] = { ...section, title };
                        savePriceSections(next);
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="mt-6 shrink-0 text-[var(--text-3)]"
                      onClick={() => savePriceSections(priceSections.filter((_, i) => i !== sectionIndex))}
                    >
                      Entfernen
                    </Button>
                  </div>
                  <ForgeFieldTextArea
                    label="Preise"
                    id={`forge-price-rows-${section.id}`}
                    rows={5}
                    hint="Format: Leistung|Preis — eine Zeile pro Eintrag."
                    value={formatPriceRows(section.rows ?? [])}
                    onChange={(value) => {
                      const next = [...priceSections];
                      next[sectionIndex] = {
                        ...section,
                        rows: parsePriceRows(value).map((row, rowIndex) => ({
                          id: section.rows?.[rowIndex]?.id ?? `${section.id}-row-${rowIndex}`,
                          label: row.label,
                          price: row.price,
                        })),
                      };
                      savePriceSections(next);
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MinisiteEditorSection>

      {/* Kontakt page */}
      <MinisiteEditorSection id="forge-kontakt-page" title="Kontakt" description="Inhalt für /kontakt.">
        <div className="space-y-[var(--space-4)]">
          <SingleImagePicker
            label="Hero-Bild"
            hint="Vollbild oben auf der Kontaktseite."
            path={content.sections?.contact?.image_path}
            gallery={gallery}
            uploading={uploading === "section-contact"}
            onUpload={(file) => uploadSection({ section: "contact", field: "image_path" }, file)}
            onPick={(path) => onContentChange(patchSectionImagePath(content, "contact", "image_path", path))}
            onClear={() =>
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  contact: { ...(content.sections?.contact ?? {}), image_path: undefined },
                },
              })
            }
          />
          <ForgeFieldInput
            label="Seitentitel"
            id="forge-contact-title"
            value={content.sections?.contact?.title ?? "Kontakt"}
            onChange={(v) =>
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  contact: { ...(content.sections?.contact ?? {}), title: v || undefined },
                },
              })
            }
          />
          <ForgeFieldInput
            label="Intro unter dem Titel"
            id="forge-contact-eyebrow"
            value={content.sections?.contact?.eyebrow ?? ""}
            placeholder="Telefon, Termin oder Nachricht — wir sind für dich da."
            onChange={(v) =>
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  contact: { ...(content.sections?.contact ?? {}), eyebrow: v || undefined },
                },
              })
            }
          />
          <ForgeFieldTextArea
            label="Öffnungszeiten (eine Zeile oder mehrere)"
            id="forge-contact-subtitle"
            rows={3}
            value={content.sections?.contact?.subtitle ?? ""}
            onChange={(v) =>
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  contact: { ...(content.sections?.contact ?? {}), subtitle: v || undefined },
                },
              })
            }
          />
          <ForgeFieldTextArea
            label="Anfahrt"
            id="forge-contact-text"
            rows={3}
            hint="Text unter der Karte. Standort kommt aus Adresse + Google-Maps-Link."
            value={content.sections?.contact?.text ?? DEFAULT_KONTAKT_MAP_DIRECTIONS}
            onChange={(v) =>
              onContentChange({
                ...content,
                sections: {
                  ...(content.sections ?? {}),
                  contact: { ...(content.sections?.contact ?? {}), text: v || undefined },
                },
              })
            }
          />
        </div>
      </MinisiteEditorSection>
    </div>
  );
}
