import { resolveNicolesAboutBlocks } from "@/lib/minisite/nicoles-about-blocks";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesAboutPageHero } from "./nicoles-about-page-hero";
import { NicolesAboutPageStory } from "./nicoles-about-page-story";
import { NicolesAboutPageTeam } from "./nicoles-about-page-team";
import { NicolesAboutPageTitle } from "./nicoles-about-page-title";

type NicolesAboutPageProps = {
  data: ShopPublicData;
};

export function NicolesAboutPage({ data }: NicolesAboutPageProps) {
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
    <article id="ms-nicoles-about" aria-label="Über uns">
      <NicolesAboutPageHero block={heroBlock} content={content} />
      <NicolesAboutPageTitle title={introBlock?.title?.trim() || "Über uns"} />
      <NicolesAboutPageStory text={introBlock?.text} />
      <NicolesAboutPageTeam heading={teamHeading?.eyebrow} profiles={teamProfiles} />
    </article>
  );
}
