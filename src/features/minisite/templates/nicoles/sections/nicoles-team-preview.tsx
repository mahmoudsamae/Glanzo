import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import { getNicolesSectionField, NICOLES_SECTION_META } from "@/lib/minisite/nicoles-sections";
import { nicolesStockTeam } from "@/lib/minisite/nicoles-stock-images";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../nicoles-media";
import { NicolesPillLink } from "../nicoles-pill-link";

type NicolesTeamPreviewProps = {
  data: ShopPublicData;
  preview?: boolean;
};

export function NicolesTeamPreview({ data, preview = false }: NicolesTeamPreviewProps) {
  const content = data.minisite.content;
  const anchors = getMinisiteAnchors("nicoles");
  const meta = NICOLES_SECTION_META.team;
  const blockPaths = content.sections?.team?.image_paths ?? [];
  const photos = [
    blockPaths[0] ?? nicolesStockTeam(0),
    blockPaths[1] ?? nicolesStockTeam(1),
    blockPaths[2] ?? nicolesStockTeam(2),
  ];

  return (
    <section
      id="ms-nicoles-team"
      className="ms-nicoles-team-preview ms-nicoles-section ms-cinema-section bg-[color:var(--ms-nicoles-cream)] px-[var(--space-4)] py-[var(--space-14)]"
      aria-label="Team"
    >
      <div className="mx-auto max-w-5xl text-center">
        <p className="ms-nicoles-eyebrow">
          {getNicolesSectionField(content, "team", "eyebrow", meta.defaults.eyebrow ?? "")}
        </p>

        <div className="mx-auto mt-[var(--space-6)] grid max-w-3xl grid-cols-3 gap-[var(--space-3)]">
          {photos.map((path, index) => (
            <div
              key={`team-photo-${index}`}
              className="relative aspect-square overflow-hidden bg-[color:var(--ms-border-subtle)]"
            >
              <NicolesPhoto path={path} sizes="120px" />
            </div>
          ))}
        </div>

        <h2 className="ms-nicoles-display mx-auto mt-[var(--space-8)] max-w-xl font-display text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.12] text-[color:var(--ms-nicoles-ink)]">
          {getNicolesSectionField(content, "team", "title", meta.defaults.title ?? "")}
        </h2>
        <p className="mx-auto mt-[var(--space-4)] max-w-lg text-md leading-relaxed text-[color:var(--ms-nicoles-ink-muted)]">
          {getNicolesSectionField(content, "team", "text", meta.defaults.text ?? "")}
        </p>
        <div className="mt-[var(--space-6)]">
          <NicolesPillLink
            href={`#${anchors.about}`}
            label={getNicolesSectionField(content, "team", "cta_label", meta.defaults.cta_label ?? "LERNE UNSER TEAM KENNEN")}
            preview={preview}
          />
        </div>
      </div>
    </section>
  );
}
