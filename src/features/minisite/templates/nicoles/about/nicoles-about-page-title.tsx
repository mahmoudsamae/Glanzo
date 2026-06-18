type NicolesAboutPageTitleProps = {
  title?: string;
};

export function NicolesAboutPageTitle({ title = "Über uns" }: NicolesAboutPageTitleProps) {
  return (
    <section
      className="ms-nicoles-about-page-title ms-nicoles-section ms-cinema-section bg-[color:var(--ms-nicoles-cream)] px-[var(--space-4)] py-[var(--space-12)] text-center"
      aria-labelledby="nicoles-about-page-heading"
    >
      <span className="ms-nicoles-sparkle mb-[var(--space-3)] inline-block" aria-hidden>
        ✦
      </span>
      <h1
        id="nicoles-about-page-heading"
        className="ms-nicoles-display font-display text-[clamp(2rem,5vw,3rem)] text-[color:var(--ms-nicoles-ink)]"
      >
        {title}
      </h1>
    </section>
  );
}
