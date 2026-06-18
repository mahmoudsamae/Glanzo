import {
  nicolesTerminIntro,
  nicolesTerminPageTitle,
} from "@/lib/minisite/nicoles-terminbuchung-page";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesTerminbuchungIntro } from "./nicoles-terminbuchung-intro";
import { NicolesTerminbuchungOptions } from "./nicoles-terminbuchung-options";
import { NicolesTerminbuchungPageHero } from "./nicoles-terminbuchung-page-hero";
import { NicolesTerminbuchungPageTitle } from "./nicoles-terminbuchung-page-title";

type NicolesTerminbuchungPageProps = {
  data: ShopPublicData;
};

export function NicolesTerminbuchungPage({ data }: NicolesTerminbuchungPageProps) {
  const content = data.minisite.content;

  return (
    <article aria-label="Terminbuchung">
      <NicolesTerminbuchungPageHero content={content} />
      <NicolesTerminbuchungPageTitle title={nicolesTerminPageTitle(content)} />
      <NicolesTerminbuchungIntro text={nicolesTerminIntro(content)} />
      <NicolesTerminbuchungOptions content={content} />
    </article>
  );
}
