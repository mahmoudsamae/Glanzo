import type { MinisiteContent } from "@/lib/validations/public-shop";

import { SignatureSectionShell } from "../signature-section-shell";

type SignatureGuidelinesPanelProps = {
  content: MinisiteContent;
};

export function SignatureGuidelinesPanel({ content }: SignatureGuidelinesPanelProps) {
  if (content.show?.guidelines === false) {
    return null;
  }

  const guidelines = content.visitor_guidelines?.trim();
  if (!guidelines) {
    return null;
  }

  const paragraphs = guidelines.split(/\n{2,}|\n/).map((line) => line.trim()).filter(Boolean);

  return (
    <section
      aria-label="Hinweise für Gäste"
      className="ms-signature-band ms-signature-band--cream ms-signature-section ms-cinema-section px-[var(--space-4)] py-[var(--space-10)]"
    >
      <SignatureSectionShell>
        <div className="ms-signature-card">
          <header className="mb-[var(--space-4)] text-center">
            <p className="ms-signature-eyebrow">Etikette</p>
            <h2 className="font-display text-2xl text-[color:var(--ms-text)]">Gut zu wissen</h2>
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
      </SignatureSectionShell>
    </section>
  );
}
