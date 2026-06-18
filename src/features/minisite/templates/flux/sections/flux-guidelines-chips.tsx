import type { MinisiteContent } from "@/lib/validations/public-shop";

type FluxGuidelinesChipsProps = {
  content: MinisiteContent;
};

export function FluxGuidelinesChips({ content }: FluxGuidelinesChipsProps) {
  if (content.show?.guidelines === false) {
    return null;
  }

  const guidelines = content.visitor_guidelines?.trim();
  if (!guidelines) {
    return null;
  }

  const lines = guidelines.split(/\n{2,}|\n/).map((line) => line.trim()).filter(Boolean);

  return (
    <section aria-label="Hinweise für Gäste" className="ms-flux-section px-[var(--space-4)] py-[var(--space-8)]">
        <p className="ms-flux-kicker mb-[var(--space-3)]">Gut zu wissen</p>
      <ul className="flex flex-wrap gap-[var(--space-2)]">
        {lines.map((line, index) => (
          <li key={`${line}-${index}`} className="ms-flux-guideline-chip">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
