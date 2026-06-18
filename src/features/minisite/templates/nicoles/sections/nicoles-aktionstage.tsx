import {
  getNicolesSectionField,
  NICOLES_SECTION_META,
  parseAktionstageRows,
} from "@/lib/minisite/nicoles-sections";
import { resolveNicolesAktionstageImage } from "@/lib/minisite/nicoles-stock-images";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { NicolesPhoto } from "../nicoles-media";

type NicolesAktionstageProps = {
  data: ShopPublicData;
};

export function NicolesAktionstage({ data }: NicolesAktionstageProps) {
  const content = data.minisite.content;
  const meta = NICOLES_SECTION_META.aktionstage;
  const bgPath = resolveNicolesAktionstageImage(content);
  const rows = parseAktionstageRows(
    getNicolesSectionField(content, "aktionstage", "text", meta.defaults.text ?? ""),
  );

  return (
    <section
      className="ms-nicoles-aktionstage ms-nicoles-section ms-cinema-section relative overflow-hidden"
      aria-label="Aktionstage"
    >
      <div className="absolute inset-0">
        <NicolesPhoto path={bgPath} sizes="100vw" />
      </div>
      <div className="ms-nicoles-aktionstage-overlay absolute inset-0" aria-hidden />

      <div className="relative z-10 flex justify-center px-[var(--space-4)] py-[var(--space-14)]">
        <div className="ms-nicoles-aktionstage-box w-full max-w-[37.5rem] px-[var(--space-6)] py-[var(--space-8)] text-center">
          <p className="ms-nicoles-eyebrow text-[color:var(--ms-accent)]">
            {getNicolesSectionField(content, "aktionstage", "eyebrow", meta.defaults.eyebrow ?? "")}
          </p>
          <h2 className="ms-nicoles-display mt-[var(--space-4)] font-display text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.12] text-white">
            {getNicolesSectionField(content, "aktionstage", "title", meta.defaults.title ?? "")}
          </h2>
          <ul className="mt-[var(--space-6)] space-y-[var(--space-4)] text-left text-sm leading-relaxed text-white">
            {rows.map((row) => (
              <li key={`${row.day}-${row.label}`} className="grid grid-cols-[5.5rem_1fr] gap-[var(--space-3)]">
                <span className="font-bold">{row.day}</span>
                <span>{row.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
