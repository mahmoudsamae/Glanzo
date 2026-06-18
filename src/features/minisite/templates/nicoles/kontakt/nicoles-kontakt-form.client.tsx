"use client";

import { useState } from "react";

type NicolesKontaktFormProps = {
  email: string;
  shopName: string;
};

export function NicolesKontaktForm({ email, shopName }: NicolesKontaktFormProps) {
  const [name, setName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(`Terminanfrage – ${shopName}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `E-Mail: ${formEmail}`,
        `Telefon: ${phone}`,
        "",
        "Wunschtermin / Nachricht:",
        message,
      ].join("\n"),
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <section
      className="ms-nicoles-kontakt-form-section ms-nicoles-section ms-cinema-section bg-[color:var(--ms-nicoles-cream)] px-[var(--space-4)] py-[var(--space-14)]"
      aria-labelledby="nicoles-kontakt-form-heading"
    >
      <div className="mx-auto max-w-xl">
        <p className="ms-nicoles-eyebrow text-center">Kontaktformular</p>
        <h2
          id="nicoles-kontakt-form-heading"
          className="ms-nicoles-display mt-[var(--space-3)] text-center font-display text-[clamp(1.75rem,4vw,2.5rem)] text-[color:var(--ms-nicoles-ink)]"
        >
          Termin buchen
        </h2>

        <form className="mt-[var(--space-8)] space-y-[var(--space-4)]" onSubmit={handleSubmit}>
          <label className="block">
            <span className="sr-only">Vorname Nachname</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              placeholder="Vorname Nachname"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="ms-nicoles-kontakt-input w-full"
            />
          </label>

          <label className="block">
            <span className="sr-only">E-Mail</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="E-Mail"
              value={formEmail}
              onChange={(event) => setFormEmail(event.target.value)}
              className="ms-nicoles-kontakt-input w-full"
            />
          </label>

          <label className="block">
            <span className="sr-only">Telefon</span>
            <input
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="Telefon"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="ms-nicoles-kontakt-input w-full"
            />
          </label>

          <label className="block">
            <span className="sr-only">Wunschtermin / Nachricht</span>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Wunschtermin / Nachricht"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="ms-nicoles-kontakt-input w-full resize-y"
            />
          </label>

          <div className="pt-[var(--space-2)] text-center">
            <button type="submit" className="ms-nicoles-pill-cta">
              Anfrage senden
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
