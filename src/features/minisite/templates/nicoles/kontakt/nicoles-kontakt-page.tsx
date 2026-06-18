import {
  nicolesKontaktPageTitle,
  resolveKontaktEmail,
} from "@/lib/minisite/nicoles-kontakt-page";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesKontaktForm } from "./nicoles-kontakt-form.client";
import { NicolesKontaktInfo } from "./nicoles-kontakt-info";
import { NicolesKontaktMap } from "./nicoles-kontakt-map";
import { NicolesKontaktPageHero } from "./nicoles-kontakt-page-hero";
import { NicolesKontaktPageTitle } from "./nicoles-kontakt-page-title";

type NicolesKontaktPageProps = {
  data: ShopPublicData;
};

export function NicolesKontaktPage({ data }: NicolesKontaktPageProps) {
  const content = data.minisite.content;

  return (
    <article aria-label="Kontakt">
      <NicolesKontaktPageHero content={content} />
      <NicolesKontaktPageTitle title={nicolesKontaktPageTitle(content)} />
      <NicolesKontaktInfo data={data} />
      <NicolesKontaktForm email={resolveKontaktEmail(content)} shopName={data.shop.name} />
      <NicolesKontaktMap data={data} />
    </article>
  );
}
