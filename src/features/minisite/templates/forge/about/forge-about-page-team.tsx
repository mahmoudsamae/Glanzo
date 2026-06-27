import type { AboutBlock } from "@/lib/minisite/about-blocks";
import { forgeReveal } from "@/lib/minisite/forge-motion";
import { nicolesStockTeam } from "@/lib/minisite/nicoles-stock-images";
import { splitParagraphs } from "@/lib/minisite/nicoles-about-blocks";

import { NicolesPhoto } from "../../nicoles/nicoles-media";
import { ForgeShineFrame } from "../forge-shine-frame";

type ForgeAboutPageTeamProps = {
  heading?: string;
  profiles: AboutBlock[];
};

export function ForgeAboutPageTeam({ heading = "UNSER TEAM", profiles }: ForgeAboutPageTeamProps) {
  const visibleProfiles = profiles.filter(
    (block) => block.title?.trim() || block.text?.trim() || block.image_path,
  );

  if (visibleProfiles.length === 0 && !heading.trim()) {
    return null;
  }

  return (
    <section
      id="ms-forge-about-team"
      className="ms-forge-about-page-team ms-forge-section ms-cinema-section"
      aria-label="Team"
    >
      {heading.trim() ? (
        <p {...forgeReveal("up", 0)} className="ms-forge-eyebrow ms-forge-about-page-team-label">
          {heading}
        </p>
      ) : null}

      <ul className="ms-forge-about-page-team-list" data-forge-stagger>
        {visibleProfiles.map((block, index) => {
          const reversed = block.layout ? block.layout === "reversed" : index % 2 === 1;
          const paragraphs = splitParagraphs(block.text);
          const imagePath = block.image_path ?? nicolesStockTeam(index);

          return (
            <li
              key={block.id}
              className={`ms-forge-about-page-profile${reversed ? " ms-forge-about-page-profile--reversed" : ""}`}
            >
              <div
                {...forgeReveal(
                  reversed ? "right" : "left",
                  index * 100,
                  "ms-forge-about-page-profile-media-wrap ms-forge-reveal--wide",
                )}
              >
                <ForgeShineFrame className="ms-forge-about-page-profile-media">
                  <NicolesPhoto
                    path={imagePath}
                    alt={block.title?.trim() ? `${block.title} — Team` : ""}
                    sizes="(min-width:1024px) 312px, 72vw"
                    className="ms-forge-portrait-cover"
                    color
                  />
                </ForgeShineFrame>
              </div>

              <div
                {...forgeReveal(
                  reversed ? "left" : "right",
                  index * 100 + 120,
                  "ms-forge-about-page-profile-copy ms-forge-reveal--wide",
                )}
              >
                {block.title ? <h2 className="ms-forge-about-page-profile-name">{block.title}</h2> : null}
                {block.subtitle ? <p className="ms-forge-eyebrow ms-forge-about-page-profile-role">{block.subtitle}</p> : null}
                <div className="ms-forge-about-page-profile-text">
                  {paragraphs.map((line, lineIndex) => (
                    <p key={`${block.id}-${lineIndex}`}>{line}</p>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
