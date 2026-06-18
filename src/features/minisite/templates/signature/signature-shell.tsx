import type { ShopPublicData } from "@/lib/validations/public-shop";

import { BookBarSection } from "../../sections/book-bar";
import { SignatureGalleryShowcase } from "./sections/signature-gallery-showcase";
import { SignatureGuidelinesPanel } from "./sections/signature-guidelines-panel";
import { SignaturePriceBoard } from "./sections/signature-price-board";
import { SignatureTeamRoster } from "./sections/signature-team-roster";
import { SignatureVisitPanel } from "./sections/signature-visit-panel";
import { SignatureAmbient } from "./signature-ambient.client";
import { SignatureHeroSection } from "./signature-hero";

type SignatureShellProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function SignatureShell({ data, shopSlug, preview = false }: SignatureShellProps) {
  const bookHref = `/s/${shopSlug}?book=1`;
  const isSuspended = data.shop.status === "suspended";

  return (
    <div className="ms-signature-root relative flex min-h-full flex-1 flex-col">
      {preview ? null : <SignatureAmbient />}
      <main
        className={`relative z-[1] mx-auto flex w-full max-w-md flex-1 flex-col ${
          preview
            ? "pb-[var(--space-4)]"
            : "pb-[calc(var(--space-16)+env(safe-area-inset-bottom))]"
        }`}
      >
        <SignatureHeroSection data={data} bookHref={bookHref} preview={preview} />
        <SignaturePriceBoard services={data.services} content={data.minisite.content} />
        <SignatureTeamRoster data={data} bookHrefBase={bookHref} preview={preview} />
        <SignatureGalleryShowcase content={data.minisite.content} />
        <SignatureGuidelinesPanel content={data.minisite.content} />
        <SignatureVisitPanel data={data} />
      </main>
      {preview ? null : <BookBarSection bookHref={bookHref} suspended={isSuspended} />}
    </div>
  );
}
