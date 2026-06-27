import { forgeFooterContactHash } from "@/lib/minisite/forge-section-scroll";
import { forgeReveal } from "@/lib/minisite/forge-motion";
import { resolveKontaktEmail } from "@/lib/minisite/nicoles-kontakt-page";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { ForgeScrollCue } from "../forge-scroll-cue";
import { ForgeKontaktDirections } from "./forge-kontakt-directions";
import { ForgeKontaktForm } from "./forge-kontakt-form.client";

type ForgeKontaktMainProps = {
  data: ShopPublicData;
};

export function ForgeKontaktMain({ data }: ForgeKontaktMainProps) {
  const email = resolveKontaktEmail(data.minisite.content);

  return (
    <div className="ms-forge-section-stack">
      <section
        id="ms-forge-kontakt-main"
        className="ms-forge-kontakt-main ms-forge-section ms-cinema-section"
        aria-label="Termin und Anfahrt"
      >
        <div {...forgeReveal("up", 80)} className="ms-forge-kontakt-main-grid">
          <ForgeKontaktForm email={email} shopName={data.shop.name} />
          <ForgeKontaktDirections data={data} />
        </div>
      </section>
      <ForgeScrollCue
        href={forgeFooterContactHash()}
        className="ms-forge-scroll-cue ms-forge-scroll-cue--section-end"
      />
    </div>
  );
}
