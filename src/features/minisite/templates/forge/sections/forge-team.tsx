import Image from "next/image";

import { forgeReveal } from "@/lib/minisite/forge-motion";
import { getForgeSectionField, FORGE_SECTION_META } from "@/lib/minisite/forge-sections";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";
import { NicolesPillLink } from "../../nicoles/nicoles-pill-link";
import { ForgeShineFrame } from "../forge-shine-frame";

type ForgeTeamSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
};

export function ForgeTeamSection({ data, shopSlug, preview = false }: ForgeTeamSectionProps) {
  const content = data.minisite.content;
  const meta = FORGE_SECTION_META.team;
  const paths = (content.sections?.team?.image_paths ?? []).filter(Boolean).slice(0, 3);
  const aboutHref = preview ? "#ms-nicoles-about" : `/s/${shopSlug}/about`;

  return (
    <section
      id="ms-nicoles-team"
      className="ms-forge-team ms-forge-section ms-cinema-section"
      aria-label="Team"
    >
      <div className="ms-forge-team-inner">
        <p {...forgeReveal("up", 0)} className="ms-forge-eyebrow">
          {getForgeSectionField(content, "team", "eyebrow", meta.defaults.eyebrow ?? "")}
        </p>

        {paths.length > 0 ? (
          <ul {...forgeReveal("fade", 80)} className="ms-forge-team-photos" data-forge-stagger>
            {paths.map((path, index) => (
              <li key={`${path}-${index}`} {...forgeReveal("scale", index * 90)}>
                <ForgeShineFrame variant="media" className="ms-forge-team-photo">
                  <Image
                    src={shopMediaPublicUrl(path)}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 200px, 30vw"
                    className="object-cover"
                  />
                </ForgeShineFrame>
              </li>
            ))}
          </ul>
        ) : null}

        <h2 {...forgeReveal("up", 140)} className="ms-forge-section-title mx-auto mt-[var(--space-8)] max-w-xl text-center">
          {getForgeSectionField(content, "team", "title", meta.defaults.title ?? "")}
        </h2>
        <p {...forgeReveal("up", 200)} className="ms-forge-section-text mx-auto mt-[var(--space-4)] max-w-lg text-center">
          {getForgeSectionField(content, "team", "text", meta.defaults.text ?? "")}
        </p>
        <div {...forgeReveal("fade", 260)} className="mt-[var(--space-6)] flex justify-center">
          <NicolesPillLink
            href={aboutHref}
            label={getForgeSectionField(content, "team", "cta_label", meta.defaults.cta_label ?? "LERNE UNSER TEAM KENNEN")}
            preview={preview}
          />
        </div>
      </div>
    </section>
  );
}
