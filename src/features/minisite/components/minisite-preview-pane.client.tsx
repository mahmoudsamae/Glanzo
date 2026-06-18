"use client";

import type { CSSProperties } from "react";

import { deriveAccentCssVars } from "@/lib/color/accent";
import { mergeEditorDraftIntoPublicData } from "@/lib/minisite/editor-preview";
import type { MinisiteSaveInput } from "@/lib/validations/minisite-editor";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { MinisiteShell } from "../templates/minisite-shell";
import { getMinisiteTemplate } from "../templates/registry";
import { MinisitePreviewReveal } from "./minisite-preview-reveal.client";

import "@/styles/themes/classic.css";
import "@/styles/themes/midnight.css";
import "@/styles/themes/bold.css";
import "@/styles/themes/signature.css";
import "@/styles/themes/boutique.css";
import "@/styles/themes/nicoles.css";
import "@/styles/themes/flux.css";

type MinisitePreviewPaneProps = {
  shopSlug: string;
  publicData: ShopPublicData;
  draft: MinisiteSaveInput;
};

export function MinisitePreviewPane({ shopSlug, publicData, draft }: MinisitePreviewPaneProps) {
  const merged = mergeEditorDraftIntoPublicData(publicData, draft);
  const template = getMinisiteTemplate(draft.template);
  const accentVars = deriveAccentCssVars(draft.accentHex, draft.template);

  return (
    <div
      className={`minisite minisite-preview ${template.themeClass} ${template.fontClass} salon-dash-minisite-preview-device flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[1.75rem] border border-[var(--ink-3)] bg-[color:var(--ms-bg)] shadow-lg`}
      style={accentVars as CSSProperties}
    >
      <div className="salon-dash-scroll salon-dash-minisite-preview-scroll min-h-0 min-w-0 flex-1 overflow-x-clip overflow-y-auto overscroll-contain">
        <MinisitePreviewReveal key={draft.template} />
        <MinisiteShell
          key={`${draft.template}-${draft.accentHex}`}
          data={merged}
          shopSlug={shopSlug}
          preview
        />
      </div>
    </div>
  );
}
