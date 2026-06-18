"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import {
  DashboardPanel,
  DashboardPrimaryButton,
} from "@/features/dashboard";
import { Label } from "@/components/ui/label";
import type { MinisiteEditorData } from "@/lib/minisite/editor-types";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { saveMinisiteAction } from "../api";

type SectionKey = keyof NonNullable<MinisiteContent["show"]>;

const SECTION_TOGGLES: Array<{
  key: SectionKey;
  label: string;
  description: string;
}> = [
  {
    key: "cover",
    label: "Titelbild",
    description: "Großes Hero-Bild oben auf der Seite.",
  },
  {
    key: "about",
    label: "Über uns",
    description: "Kurztext unter der Überschrift im Hero.",
  },
  {
    key: "prices",
    label: "Preisliste",
    description: "Alle aktiven Services mit Preisen.",
  },
  {
    key: "team",
    label: "Team",
    description: "Barber-Karten mit Buchungslink.",
  },
  {
    key: "gallery",
    label: "Galerie",
    description: "Foto-Raster — nur sichtbar wenn Fotos hochgeladen sind.",
  },
  {
    key: "location",
    label: "Standort",
    description: "Adresse und Maps-Link.",
  },
  {
    key: "hours",
    label: "Öffnungszeiten",
    description: "Wochenplan aus deinen Shop-Einstellungen.",
  },
  {
    key: "social",
    label: "Social Links",
    description: "Instagram, WhatsApp & Co. im Footer-Bereich.",
  },
  {
    key: "guidelines",
    label: "Hinweise für Gäste",
    description: "Regeln, Anfahrt, Storno-Hinweise — eigener Abschnitt.",
  },
];

function isSectionVisible(content: MinisiteContent, key: SectionKey): boolean {
  return content.show?.[key] !== false;
}

type MinisitePageSettingsProps = {
  initial: MinisiteEditorData;
  content?: MinisiteContent;
  onContentChange?: (content: MinisiteContent) => void;
  /** When true, parent handles save (e.g. Minisite editor header). */
  embedded?: boolean;
  showDesignLink?: boolean;
  /** Render only one block — for accordion sections in the Minisite editor. */
  part?: "all" | "sections" | "guidelines";
};

export function MinisitePageSettings({
  initial,
  content: controlledContent,
  onContentChange,
  embedded = false,
  showDesignLink = true,
  part = "all",
}: MinisitePageSettingsProps) {
  const [internalContent, setInternalContent] = useState<MinisiteContent>(initial.content);
  const content = controlledContent ?? internalContent;
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!controlledContent) {
      setInternalContent(initial.content);
    }
  }, [controlledContent, initial.content]);

  function updateContent(next: MinisiteContent) {
    if (onContentChange) {
      onContentChange(next);
    } else {
      setInternalContent(next);
    }
    setSaved(false);
  }

  function patchContent(patch: Partial<MinisiteContent>) {
    updateContent({ ...content, ...patch });
  }

  function toggleSection(key: SectionKey, visible: boolean) {
    updateContent({
      ...content,
      show: {
        ...(content.show ?? {}),
        [key]: visible,
      },
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveMinisiteAction({
        template: initial.template,
        accentHex: initial.accentHex,
        content,
      });
      if (!result.ok) {
        setError("Speichern fehlgeschlagen.");
        return;
      }
      setSaved(true);
    });
  }

  const sectionToggles = (
    <ul className="flex flex-col gap-[var(--space-2)]">
      {SECTION_TOGGLES.map((section) => {
        const visible = isSectionVisible(content, section.key);
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
                disabled={isPending && !embedded}
                onChange={(event) => toggleSection(section.key, event.target.checked)}
              />
            </label>
          </li>
        );
      })}
    </ul>
  );

  const guidelinesFields = (
    <div className="space-y-[var(--space-4)]">
      <div>
        <Label htmlFor="visitor-guidelines">Hinweise für Gäste</Label>
        <textarea
          id="visitor-guidelines"
          rows={5}
          className="salon-dash-search mt-[var(--space-2)] min-h-[7rem] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm leading-relaxed"
          placeholder="z. B. Parkplatz hinten, bitte 5 Min. früher da sein, Barzahlung bevorzugt…"
          value={content.visitor_guidelines ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            patchContent({ visitor_guidelines: value === "" ? undefined : value });
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
          }}
        />
        <p className="mt-[var(--space-2)] text-xs text-[var(--text-3)]">
          Enter = neue Zeile. Jede Zeile erscheint als eigener Hinweis auf der Seite.
        </p>
      </div>
      <div>
        <Label htmlFor="booking-notice">Buchungshinweis</Label>
        <textarea
          id="booking-notice"
          rows={2}
          className="salon-dash-search mt-[var(--space-2)] w-full resize-y px-[var(--space-3)] py-[var(--space-2)] text-sm"
          placeholder="Kurzer Hinweis direkt beim „Jetzt buchen“-Button."
          value={content.booking_notice ?? ""}
          onChange={(event) => {
            const value = event.target.value;
            patchContent({ booking_notice: value === "" ? undefined : value });
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
          }}
        />
      </div>
    </div>
  );

  if (part === "sections") {
    return sectionToggles;
  }

  if (part === "guidelines") {
    return guidelinesFields;
  }

  return (
    <div className="space-y-[var(--space-4)]">
      <DashboardPanel
        title="Seitenabschnitte"
        description="Schalte Bereiche deiner öffentlichen Mini-Site ein oder aus — sofort live nach Speichern."
      >
        {sectionToggles}
      </DashboardPanel>

      <DashboardPanel
        title="Hinweise & Anleitungen"
        description="Was Gäste vor dem Besuch wissen sollten — erscheint als eigener Abschnitt auf der Seite."
      >
        {guidelinesFields}
      </DashboardPanel>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-[var(--signal-ok)]">Gespeichert — live auf deiner Mini-Site.</p> : null}

      {embedded ? null : (
        <div className="flex flex-wrap items-center gap-[var(--space-3)]">
          <DashboardPrimaryButton type="button" disabled={isPending} onClick={save}>
            {isPending ? "Speichert…" : "Website-Einstellungen speichern"}
          </DashboardPrimaryButton>
          {showDesignLink ? (
            <Link
              href="/d/minisite"
              className="text-sm text-[var(--brass)] underline-offset-4 hover:underline"
            >
              Vorlage, Farben & Bilder bearbeiten →
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
