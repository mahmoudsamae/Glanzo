"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { shopMediaPublicUrl } from "../lib/media-url";

export function SingleImagePicker({
  label,
  hint,
  path,
  gallery,
  uploading,
  onUpload,
  onPick,
  onClear,
}: {
  label: string;
  hint?: string;
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
      {hint ? <p className="text-xs text-[var(--text-3)]">{hint}</p> : null}
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

export function MultiImagePicker({
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
                onClick={() => onChange([...paths, item].slice(0, max))}
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
