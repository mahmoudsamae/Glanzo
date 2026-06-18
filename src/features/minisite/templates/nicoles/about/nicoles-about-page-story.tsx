import { splitParagraphs } from "@/lib/minisite/nicoles-about-blocks";

type NicolesAboutPageStoryProps = {
  text?: string;
};

export function NicolesAboutPageStory({ text }: NicolesAboutPageStoryProps) {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <section
      className="ms-nicoles-about-page-story ms-nicoles-section ms-cinema-section bg-[color:var(--ms-nicoles-cream)] px-[var(--space-4)] pb-[var(--space-14)] pt-[var(--space-2)]"
      aria-label="Über uns Text"
    >
      <div className="mx-auto max-w-[50rem] space-y-[var(--space-5)]">
        {paragraphs.map((paragraph, index) => (
          <p
            key={`${index}-${paragraph.slice(0, 24)}`}
            className="ms-nicoles-about-story-text text-[1.0625rem] leading-[1.85] text-[color:var(--ms-nicoles-ink)]"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
