type NicolesTerminbuchungIntroProps = {
  text: string;
};

export function NicolesTerminbuchungIntro({ text }: NicolesTerminbuchungIntroProps) {
  return (
    <section
      className="ms-nicoles-termin-intro ms-nicoles-section ms-cinema-section bg-[color:var(--ms-nicoles-teal)] px-[var(--space-4)] py-[var(--space-12)] text-center"
      aria-label="Terminbuchung Einleitung"
    >
      <p className="mx-auto max-w-2xl text-base leading-relaxed text-[color:var(--ms-nicoles-cream)] sm:text-lg">
        {text}
      </p>
    </section>
  );
}
