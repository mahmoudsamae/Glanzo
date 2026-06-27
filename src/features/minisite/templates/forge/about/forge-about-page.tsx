import { resolveNicolesAboutBlocks } from "@/lib/minisite/nicoles-about-blocks";
import { forgeFooterContactHash } from "@/lib/minisite/forge-section-scroll";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { ForgeScrollCue } from "../forge-scroll-cue";
import { ForgeAboutPageCta } from "./forge-about-page-cta";
import { ForgeAboutPageHero } from "./forge-about-page-hero";
import { ForgeAboutPageTeam } from "./forge-about-page-team";

type ForgeAboutPageProps = {
  data: ShopPublicData;
  bookHref: string;
};

export function ForgeAboutPage({ data, bookHref }: ForgeAboutPageProps) {
  const content = data.minisite.content;

  if (content.show?.about === false) {
    return null;
  }

  const blocks = resolveNicolesAboutBlocks(content);
  const heroBlock = blocks.find((block) => block.type === "page_hero");
  const introBlock = blocks.find((block) => block.type === "intro");
  const teamHeading = blocks.find((block) => block.type === "team_heading");
  const teamProfiles = blocks.filter((block) => block.type === "team_profile");

  return (
    <article id="ms-forge-about" aria-label="Über uns">
      <ForgeAboutPageHero
        block={heroBlock}
        content={content}
        title={introBlock?.title?.trim() || "Über uns"}
        text={introBlock?.text}
        bookHref={bookHref}
      />
      <div className="ms-forge-section-stack">
        <ForgeAboutPageTeam heading={teamHeading?.eyebrow} profiles={teamProfiles} />
        <ForgeScrollCue href="#ms-forge-about-cta" className="ms-forge-scroll-cue ms-forge-scroll-cue--section-end" />
      </div>
      <div className="ms-forge-section-stack">
        <ForgeAboutPageCta bookHref={bookHref} />
        <ForgeScrollCue
          href={forgeFooterContactHash()}
          className="ms-forge-scroll-cue ms-forge-scroll-cue--section-end"
        />
      </div>
    </article>
  );
}
