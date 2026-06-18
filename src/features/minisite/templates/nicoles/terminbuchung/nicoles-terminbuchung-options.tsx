import { resolveNicolesBookingOptions } from "@/lib/minisite/nicoles-terminbuchung-page";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { NicolesBookingIcon } from "./nicoles-booking-icons";

type NicolesTerminbuchungOptionsProps = {
  content: MinisiteContent;
};

export function NicolesTerminbuchungOptions({ content }: NicolesTerminbuchungOptionsProps) {
  const options = resolveNicolesBookingOptions(content);

  return (
    <section
      className="ms-nicoles-termin-options ms-nicoles-section ms-cinema-section bg-white px-[var(--space-4)] py-[var(--space-16)]"
      aria-label="Buchungsoptionen"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-[var(--space-16)]">
        {options.map((option) => (
          <article key={option.id} className="ms-nicoles-booking-option text-center">
            <div className="mx-auto mb-[var(--space-5)] flex justify-center text-[color:var(--ms-accent)]">
              <NicolesBookingIcon kind={option.kind} />
            </div>
            <h2 className="font-display text-2xl text-[color:var(--ms-nicoles-ink)]">{option.title}</h2>
            <p className="mx-auto mt-[var(--space-4)] max-w-lg text-base leading-relaxed text-[color:var(--ms-nicoles-ink-muted)]">
              {option.description}
            </p>
            {option.href ? (
              <p className="mt-[var(--space-5)]">
                <a
                  href={option.href}
                  target={option.kind === "phone" || option.kind === "mail" ? undefined : "_blank"}
                  rel={option.kind === "phone" || option.kind === "mail" ? undefined : "noopener noreferrer"}
                  className="text-base font-semibold text-[color:var(--ms-nicoles-ink)] underline-offset-4 hover:underline"
                >
                  {option.contactLabel}
                </a>
              </p>
            ) : (
              <p className="mt-[var(--space-5)] text-base font-semibold text-[color:var(--ms-nicoles-ink)]">
                {option.contactLabel}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
