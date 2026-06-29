"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deriveAccentPalette } from "@/lib/color/accent";
import { MINISITE_ACCENT_PRESETS } from "@/lib/minisite/accent-presets";
import {
  ABOUT_BLOCK_TYPE_LABELS,
  ABOUT_BLOCK_TYPES,
  createAboutBlock,
  moveAboutBlock,
  moveNavLink,
  patchAboutBlock,
  removeAboutBlock,
  resolveAboutBlocks,
  resolveNavLinks,
  type AboutBlock,
  type AboutBlockType,
} from "@/lib/minisite/about-blocks";
import {
  BOUTIQUE_SECTION_META,
  BOUTIQUE_SECTION_KEYS,
  patchBoutiqueSectionBlock,
  moveBoutiqueSectionOrder,
  setBoutiqueSectionVisible,
  isBoutiqueSectionEnabled,
  resolveBoutiqueSectionOrder,
  type BoutiqueSectionKey,
} from "@/lib/minisite/boutique-sections";
import { getMinisiteAnchors, defaultNavLinksForTemplate } from "@/lib/minisite/template-anchors";
import { isMultiPageMinisiteTemplate } from "@/lib/minisite/multi-page-template";
import { bookingNavHrefForTemplate } from "@/lib/minisite/nav-links";
import {
  NICOLES_SECTION_META,
  resolveNicolesHomeSectionOrder,
  type NicolesHomeSectionKey,
} from "@/lib/minisite/nicoles-sections";
import { type VelvetHomeSectionKey } from "@/lib/minisite/velvet-sections";
import type { MinisiteSaveInput, ShopMediaKind } from "@/lib/validations/minisite-editor";
import {
  formatPriceRows,
  parsePriceRows,
  resolveNicolesPriceSections,
  resolveNicolesServiceCards,
} from "@/lib/minisite/nicoles-prices-page";
import { DEFAULT_NICOLES_BOOKING_INTRO } from "@/lib/minisite/nicoles-terminbuchung-page";
import { DEFAULT_KONTAKT_MAP_DIRECTIONS } from "@/lib/minisite/nicoles-kontakt-page";
import type { MinisiteContent, MinisiteTemplate } from "@/lib/validations/public-shop";
import type { MinisiteLinks } from "@/lib/validations/minisite-links";

import { shopMediaPublicUrl } from "../lib/media-url";
import { STARTER_KITS } from "@/lib/minisite/starter-kits/registry";
import { MINISITE_TEMPLATES } from "../templates/registry";
import { StarterKitPicker } from "./starter-kit-picker.client";
import { MinisiteEditorSection } from "./minisite-editor-section.client";
import { ForgeMinisitePanel } from "./forge/forge-minisite-panel.client";
import { VelvetMinisitePanel } from "./velvet/velvet-minisite-panel.client";

type SectionKey = keyof NonNullable<MinisiteContent["show"]>;

const SECTION_TOGGLES: Array<{ key: SectionKey; label: string; description: string }> = [
  { key: "cover", label: "Titelbild", description: "Großes Hero-Bild oben auf der Seite." },
  { key: "about", label: "Über uns", description: "Kurztext unter der Überschrift im Hero." },
  { key: "prices", label: "Preisliste", description: "Alle aktiven Services mit Preisen." },
  { key: "team", label: "Team", description: "Barber-Karten mit Buchungslink." },
  { key: "gallery", label: "Galerie", description: "Foto-Raster — nur sichtbar wenn Fotos hochgeladen sind." },
  { key: "location", label: "Standort", description: "Adresse und Maps-Link." },
  { key: "hours", label: "Öffnungszeiten", description: "Wochenplan aus deinen Shop-Einstellungen." },
  { key: "social", label: "Social Links", description: "Instagram, WhatsApp & Co. im Footer-Bereich." },
  { key: "guidelines", label: "Hinweise für Gäste", description: "Regeln, Anfahrt, Storno-Hinweise." },
];

function isModularMinisiteTemplate(template: MinisiteTemplate): boolean {
  return template === "boutique" || isMultiPageMinisiteTemplate(template);
}

function navHrefPresetsForTemplate(template: MinisiteTemplate) {
  const anchors = getMinisiteAnchors(template);
  const multiPage = isMultiPageMinisiteTemplate(template);
  const aboutHref = multiPage ? "/about" : `#${anchors.about}`;
  const pricesHref = multiPage ? "/leistungen" : `#${anchors.prices}`;
  const kontaktHref = multiPage ? "/kontakt" : `#${anchors.contact}`;
  const terminHref = bookingNavHrefForTemplate(template);
  return [
    { label: "Start", value: `#${anchors.top}` },
    { label: "Über uns", value: aboutHref },
    { label: "Preise", value: pricesHref },
    { label: "Kontakt", value: kontaktHref },
    { label: "Termin buchen", value: terminHref },
  ];
}

type MinisiteSectionsPanelProps = {
  shopName: string;
  shopSlug: string;
  template: MinisiteTemplate;
  allowedTemplates: MinisiteTemplate[];
  accentHex: string;
  content: MinisiteContent;
  draft: MinisiteSaveInput;
  uploading: string | null;
  onAccentChange: (hex: string) => void;
  onTemplateChange?: (template: MinisiteTemplate) => void;
  onContentChange: (content: MinisiteContent) => void;
  onUpload: (kind: ShopMediaKind, file: File) => void;
  onSectionImageUpload?: (
    target: {
      section: NicolesHomeSectionKey | VelvetHomeSectionKey | "prices" | "contact" | "news";
      field: "image_path" | "image_paths";
      index?: number;
    },
    file: File,
  ) => void;
};

const BOUTIQUE_TEXT_SECTIONS: BoutiqueSectionKey[] = ["hero", "services", "promo", "prices", "gallery", "team", "guidelines"];

const NICOLES_TEXT_SECTIONS: NicolesHomeSectionKey[] = [
  "hero",
  "about",
  "salon_banner",
  "services",
  "aktionstage",
  "team",
  "news",
];

function patchNicolesSectionBlock(
  content: MinisiteContent,
  key: NicolesHomeSectionKey,
  patch: Record<string, string | undefined>,
): MinisiteContent {
  const sections = { ...(content.sections ?? {}) };
  sections[key] = { ...(sections[key] ?? {}), ...patch };
  return { ...content, sections };
}

function moveNicolesSectionOrder(content: MinisiteContent, index: number, direction: -1 | 1): MinisiteContent {
  const order = resolveNicolesHomeSectionOrder(content);
  const target = index + direction;
  if (target < 0 || target >= order.length) {
    return content;
  }
  const next = [...order];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return { ...content, section_order: next };
}

function setNicolesSectionVisible(
  content: MinisiteContent,
  key: NicolesHomeSectionKey,
  visible: boolean,
): MinisiteContent {
  const meta = NICOLES_SECTION_META[key];
  return { ...content, show: { ...(content.show ?? {}), [meta.showKey]: visible } };
}

function NicolesSectionFieldsEditor({
  content,
  onContentChange,
}: {
  content: MinisiteContent;
  onContentChange: (c: MinisiteContent) => void;
}) {
  const fullOrder = resolveNicolesHomeSectionOrder(content);

  function patch(
    key: NicolesHomeSectionKey,
    field: "eyebrow" | "title" | "text" | "cta_label" | "badge_tiny" | "badge_medium" | "badge_large",
    value: string,
  ) {
    onContentChange(patchNicolesSectionBlock(content, key, { [field]: value || undefined }));
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <div>
        <p className="mb-[var(--space-2)] text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
          Reihenfolge & Sichtbarkeit
        </p>
        <ul className="space-y-[var(--space-1)]">
          {fullOrder.map((key, index) => {
            const meta = NICOLES_SECTION_META[key];
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
                    onChange={(e) => onContentChange(setNicolesSectionVisible(content, key, e.target.checked))}
                  />
                  An
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1"
                  disabled={index === 0}
                  onClick={() => onContentChange(moveNicolesSectionOrder(content, index, -1))}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1"
                  disabled={index === fullOrder.length - 1}
                  onClick={() => onContentChange(moveNicolesSectionOrder(content, index, 1))}
                >
                  ↓
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      {NICOLES_TEXT_SECTIONS.map((key) => {
        const meta = NICOLES_SECTION_META[key];
        const block = content.sections?.[key] ?? {};
        const hasText = key !== "hero" && key !== "salon_banner";
        const hasCta = key === "about" || key === "services" || key === "team";
        const hasBadge = key === "hero";
        return (
          <div key={key} className="space-y-[var(--space-3)] rounded border border-[var(--ink-3)] p-[var(--space-3)]">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--brass)]">{meta.label}</p>
            {"eyebrow" in meta.defaults ? (
              <div>
                <Label htmlFor={`ns-eyebrow-${key}`}>Eyebrow</Label>
                <Input
                  id={`ns-eyebrow-${key}`}
                  className="salon-dash-search mt-[var(--space-1)]"
                  placeholder={meta.defaults.eyebrow ?? ""}
                  value={block.eyebrow ?? ""}
                  onChange={(e) => patch(key, "eyebrow", e.target.value)}
                />
              </div>
            ) : null}
            <div>
              <Label htmlFor={`ns-title-${key}`}>Überschrift</Label>
              <Input
                id={`ns-title-${key}`}
                className="salon-dash-search mt-[var(--space-1)]"
                placeholder={meta.defaults.title ?? ""}
                value={block.title ?? ""}
                onChange={(e) => patch(key, "title", e.target.value)}
              />
            </div>
            {hasText ? (
              <div>
                <Label htmlFor={`ns-text-${key}`}>Text</Label>
                <textarea
                  id={`ns-text-${key}`}
                  rows={key === "aktionstage" ? 4 : 3}
                  className="salon-dash-search mt-[var(--space-1)] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm"
                  placeholder={meta.defaults.text ?? ""}
                  value={block.text ?? ""}
                  onChange={(e) => patch(key, "text", e.target.value)}
                />
                {key === "aktionstage" ? (
                  <p className="mt-1 text-xs text-[var(--text-3)]">Format: Tag|Angebot — eine Zeile pro Aktionstag.</p>
                ) : null}
              </div>
            ) : null}
            {hasCta ? (
              <div>
                <Label htmlFor={`ns-cta-${key}`}>Button-Text</Label>
                <Input
                  id={`ns-cta-${key}`}
                  className="salon-dash-search mt-[var(--space-1)]"
                  placeholder={meta.defaults.cta_label ?? ""}
                  value={block.cta_label ?? ""}
                  onChange={(e) => patch(key, "cta_label", e.target.value)}
                />
              </div>
            ) : null}
            {hasBadge ? (
              <>
                <div>
                  <Label htmlFor="ns-badge-tiny">Badge Zeile 1</Label>
                  <Input
                    id="ns-badge-tiny"
                    className="salon-dash-search mt-[var(--space-1)]"
                    value={block.badge_tiny ?? ""}
                    onChange={(e) => patch(key, "badge_tiny", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ns-badge-medium">Badge Zeile 2</Label>
                  <Input
                    id="ns-badge-medium"
                    className="salon-dash-search mt-[var(--space-1)]"
                    value={block.badge_medium ?? ""}
                    onChange={(e) => patch(key, "badge_medium", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ns-badge-large">Badge Zeile 3</Label>
                  <Input
                    id="ns-badge-large"
                    className="salon-dash-search mt-[var(--space-1)]"
                    value={block.badge_large ?? ""}
                    onChange={(e) => patch(key, "badge_large", e.target.value)}
                  />
                </div>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function NicolesPricesPageEditor({
  content,
  template,
  onContentChange,
}: {
  content: MinisiteContent;
  template?: MinisiteTemplate;
  onContentChange: (c: MinisiteContent) => void;
}) {
  const cards = resolveNicolesServiceCards(content);
  const priceSections = resolveNicolesPriceSections(content);

  function patchPricesSection(patch: Record<string, string | undefined>) {
    onContentChange({
      ...content,
      sections: {
        ...(content.sections ?? {}),
        prices: { ...(content.sections?.prices ?? {}), ...patch },
      },
    });
  }

  function saveCards(next: typeof cards) {
    onContentChange({ ...content, nicoles_service_cards: next });
  }

  function savePriceSections(next: typeof priceSections) {
    onContentChange({ ...content, nicoles_price_sections: next });
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <div>
        <Label htmlFor="nicoles-prices-title">Seitentitel</Label>
        <Input
          id="nicoles-prices-title"
          className="salon-dash-search mt-[var(--space-2)]"
          value={content.sections?.prices?.title ?? "Leistungen & Preise"}
          onChange={(e) => patchPricesSection({ title: e.target.value || undefined })}
        />
      </div>

      <div>
        <p className="mb-[var(--space-2)] text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
          Service-Karten (6)
        </p>
        {template === "forge" ? (
          <p className="mb-[var(--space-3)] text-xs text-[var(--text-2)]">
            Forge zeigt Leistungen direkt aus deinem Dashboard-Katalog (mit Foto, Beschreibung und Preis). Die Karten
            unten gelten nur für das Nicoles-Template.
          </p>
        ) : null}
        <ul className="space-y-[var(--space-2)]">
          {cards.slice(0, 6).map((card, index) => (
            <li key={card.id} className="rounded border border-[var(--ink-3)] p-[var(--space-3)]">
              <FieldInput
                label={`Karte ${index + 1}`}
                value={card.title}
                onChange={(value) => {
                  const next = [...cards];
                  next[index] = { ...card, title: value };
                  saveCards(next);
                }}
              />
            </li>
          ))}
        </ul>
        <p className="mt-[var(--space-2)] text-xs text-[var(--text-3)]">
          Fotos: Galerie Bild 1–6 (oder pro Karte im JSON später).
        </p>
      </div>

      <div>
        <p className="mb-[var(--space-2)] text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
          Preisliste
        </p>
        <ul className="space-y-[var(--space-3)]">
          {priceSections.map((section, sectionIndex) => (
            <li key={section.id} className="rounded border border-[var(--ink-3)] p-[var(--space-3)]">
              <FieldInput
                label="Kategorie"
                value={section.title}
                onChange={(value) => {
                  const next = [...priceSections];
                  next[sectionIndex] = { ...section, title: value };
                  savePriceSections(next);
                }}
              />
              <FieldTextArea
                label="Preise"
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
  );
}

function NicolesTerminbuchungPageEditor({
  content,
  onContentChange,
}: {
  content: MinisiteContent;
  onContentChange: (c: MinisiteContent) => void;
}) {
  function patchBookingSection(patch: Record<string, string | undefined>) {
    onContentChange({
      ...content,
      sections: {
        ...(content.sections ?? {}),
        booking: { ...(content.sections?.booking ?? {}), ...patch },
      },
    });
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <FieldInput
        label="Seitentitel"
        value={content.sections?.booking?.title ?? "Terminbuchung"}
        onChange={(value) => patchBookingSection({ title: value || undefined })}
      />
      <FieldTextArea
        label="Einleitung"
        rows={4}
        value={content.sections?.booking?.text ?? DEFAULT_NICOLES_BOOKING_INTRO}
        onChange={(value) => patchBookingSection({ text: value || undefined })}
      />
      <p className="text-xs text-[var(--text-3)]">
        Telefon, WhatsApp, Instagram und E-Mail werden aus Standort & Kontakt übernommen.
      </p>
    </div>
  );
}

function NicolesKontaktPageEditor({
  content,
  onContentChange,
}: {
  content: MinisiteContent;
  onContentChange: (c: MinisiteContent) => void;
}) {
  function patchContactSection(patch: Record<string, string | undefined>) {
    onContentChange({
      ...content,
      sections: {
        ...(content.sections ?? {}),
        contact: { ...(content.sections?.contact ?? {}), ...patch },
      },
    });
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <FieldInput
        label="Seitentitel"
        value={content.sections?.contact?.title ?? "Kontakt"}
        onChange={(value) => patchContactSection({ title: value || undefined })}
      />
      <FieldTextArea
        label="Öffnungszeiten (eine Zeile pro Eintrag)"
        rows={3}
        value={content.sections?.contact?.subtitle ?? ""}
        onChange={(value) => patchContactSection({ subtitle: value || undefined })}
      />
      <FieldTextArea
        label="Anfahrt / Parken"
        rows={4}
        value={content.sections?.contact?.text ?? DEFAULT_KONTAKT_MAP_DIRECTIONS}
        onChange={(value) => patchContactSection({ text: value || undefined })}
      />
      <p className="text-xs text-[var(--text-3)]">
        Adresse, Telefon und E-Mail bearbeitest du unter Standort & Kontakt.
      </p>
    </div>
  );
}

function BoutiqueSectionFieldsEditor({
  content,
  onContentChange,
}: {
  content: MinisiteContent;
  onContentChange: (c: MinisiteContent) => void;
}) {
  const order = resolveBoutiqueSectionOrder(content);
  const orderedSections = order.filter((k): k is (typeof BOUTIQUE_TEXT_SECTIONS)[number] =>
    BOUTIQUE_TEXT_SECTIONS.includes(k as typeof BOUTIQUE_TEXT_SECTIONS[number])
  );

  function patch(key: BoutiqueSectionKey, field: "eyebrow" | "title" | "text", value: string) {
    onContentChange(patchBoutiqueSectionBlock(content, key, { [field]: value || undefined }));
  }

  function move(index: number, dir: -1 | 1) {
    onContentChange(moveBoutiqueSectionOrder(content, index, dir));
  }

  function toggle(key: BoutiqueSectionKey, visible: boolean) {
    onContentChange(setBoutiqueSectionVisible(content, key, visible));
  }

  const fullOrder = resolveBoutiqueSectionOrder(content);

  return (
    <div className="space-y-[var(--space-4)]">
      {/* Section order + visibility */}
      <div>
        <p className="mb-[var(--space-2)] text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
          Reihenfolge & Sichtbarkeit
        </p>
        <ul className="space-y-[var(--space-1)]">
          {fullOrder.map((key, index) => {
            const meta = BOUTIQUE_SECTION_META[key];
            const enabled = isBoutiqueSectionEnabled(content, key);
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
                    onChange={(e) => toggle(key, e.target.checked)}
                  />
                  An
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 px-1"
                  disabled={index === fullOrder.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Section text fields */}
      {orderedSections.map((key) => {
        const meta = BOUTIQUE_SECTION_META[key];
        const block = content.sections?.[key] ?? {};
        const hasText = key === "hero" || key === "promo" || key === "guidelines";
        return (
          <div key={key} className="rounded border border-[var(--ink-3)] p-[var(--space-3)] space-y-[var(--space-3)]">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--brass)]">{meta.label}</p>
            <div>
              <Label htmlFor={`bs-eyebrow-${key}`}>Kleine Überschrift (Eyebrow)</Label>
              <Input
                id={`bs-eyebrow-${key}`}
                className="salon-dash-search mt-[var(--space-1)]"
                placeholder={meta.defaults.eyebrow ?? ""}
                value={block.eyebrow ?? ""}
                onChange={(e) => patch(key, "eyebrow", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor={`bs-title-${key}`}>Überschrift</Label>
              <Input
                id={`bs-title-${key}`}
                className="salon-dash-search mt-[var(--space-1)]"
                placeholder={meta.defaults.title ?? ""}
                value={block.title ?? ""}
                onChange={(e) => patch(key, "title", e.target.value)}
              />
            </div>
            {hasText ? (
              <div>
                <Label htmlFor={`bs-text-${key}`}>Text</Label>
                <textarea
                  id={`bs-text-${key}`}
                  rows={3}
                  className="salon-dash-search mt-[var(--space-1)] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm"
                  placeholder={meta.defaults.text ?? ""}
                  value={block.text ?? ""}
                  onChange={(e) => patch(key, "text", e.target.value)}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function MinisiteSectionsPanel({
  shopName,
  shopSlug,
  template,
  allowedTemplates,
  accentHex,
  content,
  draft,
  uploading,
  onAccentChange,
  onTemplateChange,
  onContentChange,
  onUpload,
  onSectionImageUpload,
}: MinisiteSectionsPanelProps) {
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const accentChip = deriveAccentPalette(accentHex, template);
  const modularTemplate = isModularMinisiteTemplate(template);
  const navHrefPresets = navHrefPresetsForTemplate(template);
  const defaultNavHref = `#${getMinisiteAnchors(template).about}`;
  const selectableTemplates = allowedTemplates.filter((key) => key in MINISITE_TEMPLATES);
  const allowedStarterKits = STARTER_KITS.filter((kit) => allowedTemplates.includes(kit.template));
  const canChooseTemplate = selectableTemplates.length > 1 && Boolean(onTemplateChange);

  function patchContent(patch: Partial<MinisiteContent>) {
    onContentChange({ ...content, ...patch });
  }

  function patchLinks(patch: Partial<MinisiteLinks>) {
    onContentChange({ ...content, links: { ...(content.links ?? {}), ...patch } });
  }

  function toggleSection(key: SectionKey, visible: boolean) {
    onContentChange({ ...content, show: { ...(content.show ?? {}), [key]: visible } });
  }

  // Nav links (modular templates)
  const navLinks =
    content.nav_links?.length && resolveNavLinks(content).length > 0
      ? resolveNavLinks(content)
      : modularTemplate
        ? defaultNavLinksForTemplate(template)
        : resolveNavLinks(content);
  function saveNavLinks(links: typeof navLinks) {
    patchContent({ nav_links: links });
  }

  // About blocks (boutique)
  const blocks = content.about_blocks?.length ? content.about_blocks : resolveAboutBlocks(content);
  function saveBlocks(next: AboutBlock[]) {
    patchContent({ about_blocks: next });
  }
  function patchBlock(id: string, patch: Partial<AboutBlock>) {
    saveBlocks(patchAboutBlock(blocks, id, patch));
  }
  function addBlock(type: AboutBlockType) {
    const next = [...blocks, createAboutBlock(type)];
    saveBlocks(next);
    setOpenBlockId(next[next.length - 1]!.id);
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">

      {/* ── 1. Akzentfarbe ── */}
      <MinisiteEditorSection
        id="design"
        title="Design & Template"
        description="Vorlage und Akzentfarbe für die öffentliche Seite."
        defaultOpen
      >
        <div className="space-y-[var(--space-4)]">
          {canChooseTemplate ? (
            <div>
              <p className="mb-[var(--space-2)] text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
                Vorlage wählen
              </p>
              <div className="grid grid-cols-2 gap-[var(--space-2)] sm:grid-cols-3">
                {selectableTemplates.map((key) => {
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
                      onClick={() => onTemplateChange?.(key)}
                    >
                      <span className="font-display text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-[var(--space-3)] rounded-md border border-[var(--ink-3)] px-[var(--space-3)] py-[var(--space-3)]">
              <span className="text-sm text-[var(--text-2)]">Template:</span>
              <span className="rounded-sm bg-[var(--ink-2)] px-[var(--space-2)] py-0.5 text-sm font-medium text-[var(--text-0)]">
                {MINISITE_TEMPLATES[template].label}
              </span>
              <span className="text-xs text-[var(--text-2)]">— vom Admin freigegeben</span>
            </div>
          )}

          {allowedStarterKits.length > 0 ? (
            <StarterKitPicker
              shopName={shopName}
              shopSlug={shopSlug}
              address={content.address}
              draft={draft}
              kits={allowedStarterKits}
              onApply={(next) => {
                if (!allowedTemplates.includes(next.template)) {
                  return;
                }
                onTemplateChange?.(next.template);
                onAccentChange(next.accentHex);
                onContentChange(next.content);
              }}
            />
          ) : null}

          <div>
            <p className="mb-[var(--space-2)] text-xs font-medium uppercase tracking-wider text-[var(--text-2)]">
              Akzentfarbe
            </p>
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
                onClick={() => onAccentChange(preset.hex)}
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
              onChange={(e) => onAccentChange(e.target.value)}
              className="salon-dash-search max-w-[8rem] font-mono text-sm"
              placeholder="#000000"
            />
            <span
              className="inline-flex items-center rounded-md px-[var(--space-3)] py-[var(--space-2)] text-sm"
              style={{ backgroundColor: accentChip.accent, color: accentChip.onAccent }}
            >
              AA Vorschau
            </span>
          </div>
          </div>
        </div>
      </MinisiteEditorSection>

      {template === "forge" ? (
        <ForgeMinisitePanel
          shopName={shopName}
          content={content}
          gallery={content.gallery ?? []}
          uploading={uploading}
          onContentChange={onContentChange}
          onUpload={onUpload}
          onSectionImageUpload={onSectionImageUpload}
          navLinks={navLinks}
          saveNavLinks={saveNavLinks}
          navHrefPresets={navHrefPresets}
          defaultNavHref={defaultNavHref}
          blocks={blocks}
          openBlockId={openBlockId}
          setOpenBlockId={setOpenBlockId}
          saveBlocks={saveBlocks}
          addBlock={addBlock}
          aboutBlockFields={(block) => (
            <AboutBlockFields
              block={block}
              gallery={content.gallery ?? []}
              uploading={uploading}
              onPatch={(patch) => patchBlock(block.id, patch)}
              onUpload={onUpload}
            />
          )}
        />
      ) : null}

      {template === "velvet" ? (
        <VelvetMinisitePanel
          shopName={shopName}
          content={content}
          uploading={uploading}
          onContentChange={onContentChange}
          onUpload={onUpload}
          onSectionImageUpload={onSectionImageUpload}
          navLinks={navLinks}
          saveNavLinks={saveNavLinks}
          navHrefPresets={navHrefPresets}
          defaultNavHref={defaultNavHref}
        />
      ) : null}

      {/* ── 3. Hero & Identität ── */}
      {template !== "forge" && template !== "velvet" ? (
      <MinisiteEditorSection
        id="hero"
        title="Hero & Identität"
        description="Logo, Titelbild und Überschrift oben auf der Seite."
        defaultOpen
      >
        <div className="space-y-[var(--space-4)]">
          <div>
            <Label htmlFor="hero-headline">Überschrift</Label>
            <Input
              id="hero-headline"
              className="salon-dash-search mt-[var(--space-2)]"
              placeholder={shopName}
              value={content.hero_headline ?? ""}
              onChange={(e) => patchContent({ hero_headline: e.target.value || undefined })}
            />
            <p className="mt-[var(--space-1)] text-xs text-[var(--text-3)]">
              Leer lassen = Salon-Name wird verwendet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2">
            {/* Logo */}
            <div className="space-y-[var(--space-2)]">
              <Label>Logo</Label>
              {content.logo_path ? (
                <div className="flex items-center gap-[var(--space-2)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shopMediaPublicUrl(content.logo_path)}
                    alt="Logo"
                    className="h-12 rounded object-contain"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => patchContent({ logo_path: undefined })}
                  >
                    Entfernen
                  </Button>
                </div>
              ) : null}
              <label className="cursor-pointer text-sm text-[var(--brass)]">
                {uploading === "logo" ? "Lädt…" : "+ Logo hochladen"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="sr-only"
                  disabled={uploading === "logo"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload("logo", file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            {/* Cover */}
            <div className="space-y-[var(--space-2)]">
              <Label>Titelbild (Cover)</Label>
              {content.cover_path ? (
                <div className="flex items-center gap-[var(--space-2)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shopMediaPublicUrl(content.cover_path)}
                    alt="Cover"
                    className="h-12 w-20 rounded object-cover"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => patchContent({ cover_path: undefined })}
                  >
                    Entfernen
                  </Button>
                </div>
              ) : null}
              <label className="cursor-pointer text-sm text-[var(--brass)]">
                {uploading === "cover" ? "Lädt…" : "+ Cover hochladen"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploading === "cover"}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload("cover", file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </MinisiteEditorSection>
      ) : null}

      {/* ── 4. Navigation (modular templates) ── */}
      {modularTemplate && template !== "forge" ? (
        <MinisiteEditorSection
          id="nav"
          title="Navigation"
          description="Menüpunkte — auf Mobile als Drawer, auf Desktop als Leiste."
        >
          {isMultiPageMinisiteTemplate(template) ? (
            <div className="mb-[var(--space-4)]">
              <Label htmlFor="nav-tagline">Nav-Tagline</Label>
              <Input
                id="nav-tagline"
                className="salon-dash-search mt-[var(--space-2)]"
                placeholder="friseur- & barbershop"
                value={content.sections?.nav?.text ?? ""}
                onChange={(e) =>
                  patchContent({
                    sections: {
                      ...(content.sections ?? {}),
                      nav: { ...(content.sections?.nav ?? {}), text: e.target.value || undefined },
                    },
                  })
                }
              />
            </div>
          ) : null}
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
      ) : null}

      {/* ── 5. Über uns ── */}
      {template !== "forge" && template !== "velvet" ? (
      <MinisiteEditorSection
        id="about"
        title="Über uns"
        description={
          template === "boutique"
            ? "Bausteine für die Über-uns-Seite — Hero, Text, Team-Profile, Collage, Sprach-Band."
            : isMultiPageMinisiteTemplate(template)
              ? "Bausteine für /about — Hero, Text, Team-Profile mit Foto und Bio."
              : "Kurztext der unter der Überschrift erscheint."
        }
      >
        {isModularMinisiteTemplate(template) ? (
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
                      <p className="truncate text-xs text-[var(--text-2)]">
                        {block.title || block.eyebrow || block.subtitle || "—"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => saveBlocks(moveAboutBlock(blocks, index, -1))}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={index === blocks.length - 1}
                      onClick={() => saveBlocks(moveAboutBlock(blocks, index, 1))}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setOpenBlockId(openBlockId === block.id ? null : block.id)}
                    >
                      {openBlockId === block.id ? "Schließen" : "Bearbeiten"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => saveBlocks(removeAboutBlock(blocks, block.id))}
                    >
                      ×
                    </Button>
                  </div>
                  {openBlockId === block.id ? (
                    <AboutBlockFields
                      block={block}
                      gallery={content.gallery ?? []}
                      uploading={uploading}
                      onPatch={(patch) => patchBlock(block.id, patch)}
                      onUpload={onUpload}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <Label htmlFor="about-text">Beschreibungstext</Label>
            <textarea
              id="about-text"
              rows={5}
              className="salon-dash-search mt-[var(--space-2)] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm leading-relaxed"
              placeholder="Erzähl deinen Gästen, wer ihr seid — ein paar Sätze reichen."
              value={content.about ?? ""}
              onChange={(e) => patchContent({ about: e.target.value || undefined })}
            />
          </div>
        )}
      </MinisiteEditorSection>
      ) : null}

      {/* ── 6. Seitenabschnitte ── */}
      {modularTemplate && template !== "forge" ? (
        <MinisiteEditorSection
          id="boutique-sections"
          title={
            isMultiPageMinisiteTemplate(template)
              ? "Seitenabschnitte (Nicoles)"
              : "Seitenabschnitte (Boutique)"
          }
          description="Überschriften und Texte für Hero, Leistungen, Promo-Band, Team usw."
          defaultOpen
        >
          {isMultiPageMinisiteTemplate(template) ? (
            <NicolesSectionFieldsEditor content={content} onContentChange={onContentChange} />
          ) : (
            <BoutiqueSectionFieldsEditor content={content} onContentChange={onContentChange} />
          )}
        </MinisiteEditorSection>
      ) : null}

      {isMultiPageMinisiteTemplate(template) && template !== "forge" ? (
        <MinisiteEditorSection
          id="nicoles-prices-page"
          title="Leistungen & Preise Seite"
          description="Inhalt für /leistungen — Hero, Service-Karten und Preisliste."
        >
          <NicolesPricesPageEditor content={content} template={template} onContentChange={onContentChange} />
        </MinisiteEditorSection>
      ) : null}

      {isMultiPageMinisiteTemplate(template) && template !== "forge" ? (
        <MinisiteEditorSection
          id="nicoles-termin-page"
          title="Terminbuchung Seite"
          description="Inhalt für /terminbuchung — Titel und Einleitungstext."
        >
          <NicolesTerminbuchungPageEditor content={content} onContentChange={onContentChange} />
        </MinisiteEditorSection>
      ) : null}

      {isMultiPageMinisiteTemplate(template) && template !== "forge" ? (
        <MinisiteEditorSection
          id="nicoles-kontakt-page"
          title="Kontakt Seite"
          description="Inhalt für /kontakt — Öffnungszeiten und Anfahrtstext."
        >
          <NicolesKontaktPageEditor content={content} onContentChange={onContentChange} />
        </MinisiteEditorSection>
      ) : null}

      {/* ── 7. Galerie ── */}
      {template !== "velvet" ? (
      <MinisiteEditorSection
        id="gallery"
        title="Galerie"
        description="Bis zu 8 Fotos — Hero, Über uns, Team, News und Banner."
      >
        <div className="space-y-[var(--space-3)]">
          {(content.gallery ?? []).length > 0 ? (
            <ul className="flex flex-wrap gap-[var(--space-2)]">
              {(content.gallery ?? []).map((path, index) => (
                <li key={`${path}-${index}`} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shopMediaPublicUrl(path)}
                    alt=""
                    className="size-16 rounded object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[var(--ink-0)] text-xs text-[var(--text-0)] shadow"
                    onClick={() => {
                      const next = (content.gallery ?? []).filter((_, i) => i !== index);
                      patchContent({ gallery: next.length ? next : undefined });
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {(content.gallery ?? []).length < 8 ? (
            <label className="cursor-pointer text-sm text-[var(--brass)]">
              {uploading === "gallery" ? "Lädt…" : "+ Foto hinzufügen"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={uploading === "gallery"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload("gallery", file);
                  e.target.value = "";
                }}
              />
            </label>
          ) : (
            <p className="text-xs text-[var(--text-2)]">Maximal 8 Fotos erreicht.</p>
          )}
        </div>
      </MinisiteEditorSection>
      ) : null}

      {/* ── 7. Standort & Kontakt ── */}
      {template !== "velvet" ? (
      <MinisiteEditorSection
        id="contact"
        title="Standort & Kontakt"
        description="Adresse und Social-Links — erscheinen im Footer-Bereich."
      >
        <div className="space-y-[var(--space-4)]">
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              className="salon-dash-search mt-[var(--space-2)]"
              placeholder="Musterstraße 12, 10115 Berlin"
              value={content.address ?? ""}
              onChange={(e) => patchContent({ address: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="contact-phone">Telefon</Label>
            <Input
              id="contact-phone"
              className="salon-dash-search mt-[var(--space-2)]"
              placeholder="+49 30 1234567"
              value={content.phone ?? ""}
              onChange={(e) => patchContent({ phone: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="contact-email">E-Mail</Label>
            <Input
              id="contact-email"
              type="email"
              className="salon-dash-search mt-[var(--space-2)]"
              placeholder="hallo@deinsalon.de"
              value={content.email ?? ""}
              onChange={(e) => patchContent({ email: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="link-instagram">Instagram</Label>
            <Input
              id="link-instagram"
              className="salon-dash-search mt-[var(--space-2)]"
              placeholder="@deinhandle oder https://instagram.com/…"
              value={content.links?.instagram ?? ""}
              onChange={(e) => patchLinks({ instagram: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="link-whatsapp">WhatsApp</Label>
            <Input
              id="link-whatsapp"
              className="salon-dash-search mt-[var(--space-2)]"
              placeholder="+49 170 1234567"
              value={content.links?.whatsapp ?? ""}
              onChange={(e) => patchLinks({ whatsapp: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="link-facebook">Facebook</Label>
            <Input
              id="link-facebook"
              className="salon-dash-search mt-[var(--space-2)]"
              placeholder="https://facebook.com/…"
              value={content.links?.facebook ?? ""}
              onChange={(e) => patchLinks({ facebook: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="link-tiktok">TikTok</Label>
            <Input
              id="link-tiktok"
              className="salon-dash-search mt-[var(--space-2)]"
              placeholder="https://tiktok.com/@…"
              value={content.links?.tiktok ?? ""}
              onChange={(e) => patchLinks({ tiktok: e.target.value || undefined })}
            />
          </div>
          <div>
            <Label htmlFor="link-maps">Google Maps</Label>
            <Input
              id="link-maps"
              className="salon-dash-search mt-[var(--space-2)]"
              placeholder="https://maps.google.com/…"
              value={content.links?.google_maps ?? ""}
              onChange={(e) => patchLinks({ google_maps: e.target.value || undefined })}
            />
          </div>
        </div>
      </MinisiteEditorSection>
      ) : null}

      {/* ── 8. Hinweise ── */}
      {template !== "velvet" ? (
      <MinisiteEditorSection
        id="guidelines"
        title="Hinweise für Gäste"
        description="Regeln, Anfahrt, Storno-Hinweise — eigener Abschnitt auf der Seite."
      >
        <div className="space-y-[var(--space-4)]">
          <div>
            <Label htmlFor="visitor-guidelines">Hinweise-Text</Label>
            <textarea
              id="visitor-guidelines"
              rows={5}
              className="salon-dash-search mt-[var(--space-2)] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm leading-relaxed"
              placeholder="z. B. Parkplatz hinten, bitte 5 Min. früher da sein, Barzahlung bevorzugt…"
              value={content.visitor_guidelines ?? ""}
              onChange={(e) => patchContent({ visitor_guidelines: e.target.value || undefined })}
            />
            <p className="mt-[var(--space-1)] text-xs text-[var(--text-3)]">
              Enter = neue Zeile. Jede Zeile erscheint als eigener Hinweis.
            </p>
          </div>
          <div>
            <Label htmlFor="booking-notice">Buchungshinweis</Label>
            <textarea
              id="booking-notice"
              rows={2}
              className="salon-dash-search mt-[var(--space-2)] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm"
              placeholder='Kurzer Hinweis direkt beim „Jetzt buchen"-Button.'
              value={content.booking_notice ?? ""}
              onChange={(e) => patchContent({ booking_notice: e.target.value || undefined })}
            />
          </div>
        </div>
      </MinisiteEditorSection>
      ) : null}

      {/* ── 9. Abschnitte ein-/ausblenden ── */}
      {template !== "velvet" ? (
      <MinisiteEditorSection
        id="visibility"
        title="Abschnitte ein-/ausblenden"
        description="Schalte einzelne Bereiche der Seite an oder aus."
      >
        <ul className="flex flex-col gap-[var(--space-2)]">
          {SECTION_TOGGLES.map((section) => {
            const visible = content.show?.[section.key] !== false;
            return (
              <li key={section.key}>
                <label className="salon-dash-toggle-row flex cursor-pointer items-center justify-between gap-[var(--space-4)]">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--text-0)]">{section.label}</span>
                    <span className="mt-[var(--space-1)] block text-xs leading-relaxed text-[var(--text-2)]">
                      {section.description}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="salon-dash-toggle size-5 shrink-0"
                    checked={visible}
                    onChange={(e) => toggleSection(section.key, e.target.checked)}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </MinisiteEditorSection>
      ) : null}
    </div>
  );
}

/* ─── About-Block field editor ─── */

function AboutBlockFields({
  block,
  gallery,
  uploading,
  onPatch,
  onUpload,
}: {
  block: AboutBlock;
  gallery: string[];
  uploading: string | null;
  onPatch: (patch: Partial<AboutBlock>) => void;
  onUpload: (kind: ShopMediaKind, file: File) => void;
}) {
  return (
    <div className="space-y-[var(--space-3)] border-t border-[var(--ink-3)] px-[var(--space-3)] py-[var(--space-3)]">
      {block.type !== "cta" && block.type !== "image_stack" ? (
        <FieldInput label="Kleine Überschrift" value={block.eyebrow ?? ""} onChange={(v) => onPatch({ eyebrow: v || undefined })} />
      ) : null}
      {block.type !== "team_heading" && block.type !== "language_band" && block.type !== "image_stack" ? (
        <FieldInput label="Titel" value={block.title ?? ""} onChange={(v) => onPatch({ title: v || undefined })} />
      ) : null}
      {block.type === "team_profile" || block.type === "page_hero" ? (
        <FieldInput
          label={block.type === "team_profile" ? "Rolle / Beruf" : "Untertitel"}
          value={block.subtitle ?? ""}
          onChange={(v) => onPatch({ subtitle: v || undefined })}
        />
      ) : null}
      {["intro", "team_profile", "salon_intro", "language_band"].includes(block.type) ? (
        <FieldTextArea
          label="Text"
          rows={block.type === "intro" ? 6 : 4}
          hint="Enter = neue Zeile"
          value={block.text ?? ""}
          onChange={(v) => onPatch({ text: v || undefined })}
        />
      ) : null}
      {block.type === "team_profile" ? (
        <div>
          <Label>Layout</Label>
          <select
            className="salon-dash-search mt-[var(--space-2)] w-full px-[var(--space-3)] py-[var(--space-2)] text-sm"
            value={block.layout ?? "normal"}
            onChange={(e) => onPatch({ layout: e.target.value as "normal" | "reversed" })}
          >
            <option value="normal">Foto oben / links</option>
            <option value="reversed">Foto unten / rechts</option>
          </select>
        </div>
      ) : null}
      {["page_hero", "team_profile"].includes(block.type) ? (
        <SingleImagePicker
          label="Foto"
          path={block.image_path}
          gallery={gallery}
          uploading={uploading === "gallery"}
          onUpload={(file) => onUpload("gallery", file)}
          onPick={(path) => onPatch({ image_path: path })}
          onClear={() => onPatch({ image_path: undefined })}
        />
      ) : null}
      {["salon_intro", "image_stack", "collage", "split_footer"].includes(block.type) ? (
        <MultiImagePicker
          label="Fotos"
          paths={block.image_paths ?? []}
          max={block.type === "salon_intro" || block.type === "split_footer" ? 2 : block.type === "collage" ? 4 : 8}
          gallery={gallery}
          uploading={uploading === "gallery"}
          onUpload={(file) => onUpload("gallery", file)}
          onChange={(paths) => onPatch({ image_paths: paths.length ? paths : undefined })}
        />
      ) : null}
    </div>
  );
}

function FieldInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="salon-dash-search mt-[var(--space-2)]" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function FieldTextArea({ label, value, rows, hint, onChange }: { label: string; value: string; rows: number; hint?: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        rows={rows}
        className="salon-dash-search mt-[var(--space-2)] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="mt-[var(--space-1)] text-xs text-[var(--text-2)]">{hint}</p> : null}
    </div>
  );
}

function SingleImagePicker({
  label,
  path,
  gallery,
  uploading,
  onUpload,
  onPick,
  onClear,
}: {
  label: string;
  path?: string;
  gallery: string[];
  uploading: boolean;
  onUpload: (file: File) => void;
  onPick: (path: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-[var(--space-2)]">
      <Label>{label}</Label>
      {path ? (
        <div className="flex items-center gap-[var(--space-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={shopMediaPublicUrl(path)} alt="" className="size-16 rounded object-cover" />
          <Button type="button" size="sm" variant="ghost" onClick={onClear}>
            Entfernen
          </Button>
        </div>
      ) : null}
      <label className="cursor-pointer text-sm text-[var(--brass)]">
        {uploading ? "Lädt…" : "+ Hochladen"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </label>
      {gallery.length > 0 ? (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {gallery.map((item) => (
            <button key={item} type="button" className="overflow-hidden rounded border border-[var(--ink-3)]" onClick={() => onPick(item)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={shopMediaPublicUrl(item)} alt="" className="size-12 object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MultiImagePicker({
  label,
  paths,
  max,
  gallery,
  uploading,
  onUpload,
  onChange,
}: {
  label: string;
  paths: string[];
  max: number;
  gallery: string[];
  uploading: boolean;
  onUpload: (file: File) => void;
  onChange: (paths: string[]) => void;
}) {
  return (
    <div className="space-y-[var(--space-2)]">
      <Label>
        {label} (max. {max})
      </Label>
      <ul className="space-y-[var(--space-2)]">
        {paths.map((path, index) => (
          <li key={`${path}-${index}`} className="flex items-center gap-[var(--space-2)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shopMediaPublicUrl(path)} alt="" className="size-12 rounded object-cover" />
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(paths.filter((_, i) => i !== index))}>
              ×
            </Button>
          </li>
        ))}
      </ul>
      {paths.length < max ? (
        <label className="cursor-pointer text-sm text-[var(--brass)]">
          {uploading ? "Lädt…" : "+ Foto hinzufügen"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </label>
      ) : null}
      {gallery.length > 0 ? (
        <div className="flex flex-wrap gap-[var(--space-2)]">
          {gallery
            .filter((item) => !paths.includes(item))
            .map((item) => (
              <button
                key={item}
                type="button"
                className="overflow-hidden rounded border border-[var(--ink-3)]"
                disabled={paths.length >= max}
                onClick={() => onChange([...paths, item])}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shopMediaPublicUrl(item)} alt="" className="size-12 object-cover" />
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}
