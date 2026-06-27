"use client";

import { savePlatformMinisiteAction } from "@/features/admin";
import { MinisiteEditor } from "@/features/minisite";
import type { MinisiteEditorData } from "@/lib/minisite/editor-types";
import type { MinisiteSaveInput } from "@/lib/validations/minisite-editor";

type AdminMinisiteEditorProps = {
  initial: MinisiteEditorData;
  shopId: string;
  shopName: string;
};

export function AdminMinisiteEditor({ initial, shopId, shopName }: AdminMinisiteEditorProps) {
  async function saveAction(input: MinisiteSaveInput) {
    return savePlatformMinisiteAction(shopId, input);
  }

  return (
    <MinisiteEditor
      initial={{ ...initial, editorMode: "admin" }}
      saveAction={saveAction}
      backHref={`/admin/shops/${shopId}`}
      header={{
        kicker: "Website einrichten",
        title: shopName,
        subtitle: "Bilder hochladen, Template wählen, Texte anpassen — der Inhaber sieht nur die fertige Seite.",
      }}
    />
  );
}
