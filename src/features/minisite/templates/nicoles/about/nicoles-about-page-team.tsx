import type { AboutBlock } from "@/lib/minisite/about-blocks";
import { nicolesStockTeam } from "@/lib/minisite/nicoles-stock-images";

import { splitParagraphs } from "@/lib/minisite/nicoles-about-blocks";

import { NicolesPhoto } from "../nicoles-media";

type NicolesAboutPageTeamProps = {
  heading?: string;
  profiles: AboutBlock[];
};

export function NicolesAboutPageTeam({ heading = "UNSER TEAM", profiles }: NicolesAboutPageTeamProps) {
  const visibleProfiles = profiles.filter(
    (block) => block.title?.trim() || block.text?.trim() || block.image_path,
  );

  if (visibleProfiles.length === 0 && !heading.trim()) {
    return null;
  }

  return (
    <section className="ms-nicoles-about-page-team ms-nicoles-section ms-cinema-section bg-[color:var(--ms-nicoles-cream)] px-[var(--space-4)] py-[var(--space-14)]" aria-label="Team">
      {heading.trim() ? (
        <p className="ms-nicoles-eyebrow mb-[var(--space-10)] text-center">{heading}</p>
      ) : null}

      <ul className="mx-auto flex max-w-6xl flex-col gap-[var(--space-12)]">
        {visibleProfiles.map((block, index) => {
          const reversed = block.layout ? block.layout === "reversed" : index % 2 === 1;
          const paragraphs = splitParagraphs(block.text);

          return (
            <li
              key={block.id}
              className="ms-nicoles-about-team-profile grid items-center gap-[var(--space-8)] lg:grid-cols-2"
            >
              <div
                className={`relative min-h-[20rem] overflow-hidden bg-[color:var(--ms-border-subtle)] lg:min-h-[31.25rem] ${
                  reversed ? "lg:order-2" : ""
                }`}
              >
                <NicolesPhoto
                  path={block.image_path ?? nicolesStockTeam(index)}
                  sizes="(min-width:1024px) 560px, 100vw"
                />
              </div>

              <div className={reversed ? "lg:order-1" : ""}>
                {block.title ? (
                  <h2 className="ms-nicoles-display ms-nicoles-display-italic font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.1] text-[color:var(--ms-nicoles-ink)]">
                    {block.title}
                  </h2>
                ) : null}
                {block.subtitle ? (
                  <p className="ms-nicoles-eyebrow mt-[var(--space-3)]">{block.subtitle}</p>
                ) : null}
                <div className="mt-[var(--space-5)] space-y-[var(--space-4)]">
                  {paragraphs.map((line, lineIndex) => (
                    <p
                      key={`${block.id}-${lineIndex}`}
                      className="text-md leading-relaxed text-[color:var(--ms-nicoles-ink-muted)]"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
