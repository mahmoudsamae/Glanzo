"use client";

import { useEffect, useState } from "react";

import type { MinisiteEditorData } from "@/lib/minisite/editor-types";

type EditorComponent = (props: { initial: MinisiteEditorData }) => React.JSX.Element;

type MinisiteEditorLoaderProps = {
  initial: MinisiteEditorData;
};

export function MinisiteEditorLoader({ initial }: MinisiteEditorLoaderProps) {
  const [Editor, setEditor] = useState<EditorComponent | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("@/features/minisite/components/minisite-editor.client").then((module) => {
      if (!cancelled) {
        setEditor(() => module.MinisiteEditor);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!Editor) {
    return (
      <div className="px-[var(--space-4)] py-[var(--space-12)] text-center text-[var(--text-2)]">
        Editor lädt…
      </div>
    );
  }

  return <Editor initial={initial} />;
}
