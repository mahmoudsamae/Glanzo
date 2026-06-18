import { BOUTIQUE_SECTION_META, getBoutiqueSectionField } from "@/lib/minisite/boutique-sections";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { BoutiqueSectionShell } from "../boutique-section-shell";

type BoutiqueGuidelinesPanelProps = {
  content: MinisiteContent;
};

export function BoutiqueGuidelinesPanel({ content }: BoutiqueGuidelinesPanelProps) {
  if (content.show?.guidelines === false) {
    return null;
  }

  const eyebrow = getBoutiqueSectionField(
    content,
    "guidelines",
    "eyebrow",
    BOUTIQUE_SECTION_META.guidelines.defaults.eyebrow ?? "Etikette",
  );
  const title = getBoutiqueSectionField(
    content,
    "guidelines",
    "title",
    BOUTIQUE_SECTION_META.guidelines.defaults.title ?? "Gut zu wissen",
  );
  const guidelines = getBoutiqueSectionField(
    content,
    "guidelines",
    "text",
    content.visitor_guidelines?.trim() ?? "",
  );

  if (!guidelines.trim()) {
    return null;
  }

  const paragraphs = guidelines.split(/\n{2,}|\n/).map((line) => line.trim()).filter(Boolean);

  return (
    <section
      aria-label="Hinweise für Gäste"
      className="ms-boutique-band ms-boutique-band--cream ms-boutique-section ms-cinema-section px-[var(--space-4)] py-[var(--space-10)]"
    >
      <BoutiqueSectionShell>
        <div className="ms-boutique-card">
          <header className="mb-[var(--space-4)] text-center">
            <p className="ms-boutique-eyebrow">{eyebrow}</p>
            <h2 className="font-display text-2xl text-[color:var(--ms-text)]">{title}</h2>
          </header>
          <ul className="space-y-[var(--space-4)]">
            {paragraphs.map((paragraph, index) => (
              <li
                key={`${paragraph}-${index}`}
                className="border-s-2 border-[color:var(--ms-accent)] ps-[var(--space-4)] text-md leading-relaxed text-[color:var(--ms-text-muted)]"
              >
                {paragraph}
              </li>
            ))}
          </ul>
        </div>
      </BoutiqueSectionShell>
    </section>
  );
}
