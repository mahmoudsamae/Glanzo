"use client";

import type { MinisiteEditorData } from "@/lib/minisite/editor-types";
import { MinisiteEditor } from "@/features/minisite/components/minisite-editor.client";

type MinisiteEditorLoaderProps = {
  initial: MinisiteEditorData;
};

export function MinisiteEditorLoader({ initial }: MinisiteEditorLoaderProps) {
  return <MinisiteEditor initial={initial} />;
}
