import type { MinisiteContent } from "@/lib/validations/public-shop";

type GuidelinesSectionProps = {
  content: MinisiteContent;
};

export function GuidelinesSection({ content }: GuidelinesSectionProps) {
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
      className="ms-cinema-section border-t border-[color:var(--ms-border-subtle)] px-[var(--space-4)] py-[var(--space-8)]"
    >
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-[var(--space-4)] flex flex-col gap-[var(--space-3)] text-center">
          <h2 className="font-display text-xl text-[color:var(--ms-text)]">Gut zu wissen</h2>
          <div className="ms-cinema-ornament" aria-hidden />
        </header>
        <div className="space-y-[var(--space-3)] text-center text-md leading-relaxed text-[color:var(--ms-text-muted)]">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
