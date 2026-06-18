"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  type NavLink,
} from "@/lib/minisite/about-blocks";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../lib/media-url";

type BoutiqueAboutEditorProps = {
  content: MinisiteContent;
  uploading: string | null;
  onContentChange: (content: MinisiteContent) => void;
  onUpload: (kind: "logo" | "cover" | "gallery", file: File) => void;
};

const HREF_PRESETS = [
  { label: "Start", value: "#ms-boutique-top" },
  { label: "Über uns", value: "#ms-boutique-about" },
  { label: "Preise", value: "#ms-boutique-prices" },
  { label: "Kontakt", value: "#ms-boutique-contact" },
  { label: "Termin buchen", value: "__book__" },
];

export function BoutiqueAboutEditor({
  content,
  uploading,
  onContentChange,
  onUpload,
}: BoutiqueAboutEditorProps) {
  const [openBlockId, setOpenBlockId] = useState<string | null>(null);
  const navLinks = resolveNavLinks(content);
  const blocks = content.about_blocks?.length ? content.about_blocks : resolveAboutBlocks(content);

  function saveNavLinks(links: NavLink[]) {
    onContentChange({ ...content, nav_links: links });
  }

  function saveBlocks(next: AboutBlock[]) {
    onContentChange({ ...content, about_blocks: next });
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
    <div className="flex flex-col gap-[var(--space-6)]">
      <section className="space-y-[var(--space-3)]">
        <div>
          <h2 className="font-display text-lg">Navigation</h2>
          <p className="mt-[var(--space-1)] text-sm text-[var(--text-2)]">
            Menüpunkte — auf Mobile als Drawer, auf Desktop als Leiste.
          </p>
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
                  value={link.href ?? "#ms-boutique-about"}
                  onChange={(e) => {
                    const next = [...navLinks];
                    next[index] = { ...link, href: e.target.value };
                    saveNavLinks(next);
                  }}
                >
                  {HREF_PRESETS.map((preset) => (
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
      </section>

      <section className="space-y-[var(--space-3)]">
        <div>
          <h2 className="font-display text-lg">Über uns — Bausteine</h2>
          <p className="mt-[var(--space-1)] text-sm text-[var(--text-2)]">
            Hero, Text, Team-Profile, Collage, Sprach-Band, Button — Reihenfolge per ↑↓.
          </p>
        </div>
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
                <BlockFields block={block} content={content} uploading={uploading} onPatch={(patch) => patchBlock(block.id, patch)} onUpload={onUpload} />
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function BlockFields({
  block,
  content,
  uploading,
  onPatch,
  onUpload,
}: {
  block: AboutBlock;
  content: MinisiteContent;
  uploading: string | null;
  onPatch: (patch: Partial<AboutBlock>) => void;
  onUpload: (kind: "logo" | "cover" | "gallery", file: File) => void;
}) {
  const gallery = content.gallery ?? [];

  return (
    <div className="space-y-[var(--space-3)] border-t border-[var(--ink-3)] px-[var(--space-3)] py-[var(--space-3)]">
      {block.type !== "cta" && block.type !== "image_stack" ? (
        <Field label="Kleine Überschrift" value={block.eyebrow ?? ""} onChange={(v) => onPatch({ eyebrow: v || undefined })} />
      ) : null}
      {block.type !== "team_heading" && block.type !== "language_band" && block.type !== "image_stack" ? (
        <Field label="Titel" value={block.title ?? ""} onChange={(v) => onPatch({ title: v || undefined })} />
      ) : null}
      {block.type === "team_profile" || block.type === "page_hero" ? (
        <Field
          label={block.type === "team_profile" ? "Rolle / Beruf" : "Untertitel (z. B. friseur- & barbershop)"}
          value={block.subtitle ?? ""}
          onChange={(v) => onPatch({ subtitle: v || undefined })}
        />
      ) : null}
      {["intro", "team_profile", "salon_intro", "language_band"].includes(block.type) ? (
        <TextArea
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
        <ImagePicker
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="salon-dash-search mt-[var(--space-2)]" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextArea({
  label,
  value,
  rows,
  hint,
  onChange,
}: {
  label: string;
  value: string;
  rows: number;
  hint?: string;
  onChange: (value: string) => void;
}) {
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

function ImagePicker({
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
