import type { ShopPublicData } from "@/lib/validations/public-shop";

import { ForgeScrollCue } from "../forge-scroll-cue";
import { ForgeKontaktMain } from "./forge-kontakt-main";
import { ForgeKontaktPageHero } from "./forge-kontakt-page-hero";
import { ForgeKontaktReachRow } from "./forge-kontakt-reach-row";

type ForgeKontaktPageProps = {
  data: ShopPublicData;
};

export function ForgeKontaktPage({ data }: ForgeKontaktPageProps) {
  const content = data.minisite.content;

  return (
    <article id="ms-forge-kontakt" aria-label="Kontakt">
      <ForgeKontaktPageHero content={content} />
      <div className="ms-forge-section-stack">
        <ForgeKontaktReachRow data={data} />
        <ForgeScrollCue
          href="#ms-forge-kontakt-main"
          className="ms-forge-scroll-cue ms-forge-scroll-cue--section-end"
        />
      </div>
      <ForgeKontaktMain data={data} />
    </article>
  );
}
