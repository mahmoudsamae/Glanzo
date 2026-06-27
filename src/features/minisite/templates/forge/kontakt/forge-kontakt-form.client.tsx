"use client";

import { useState } from "react";

type ForgeKontaktFormProps = {
  email: string;
  shopName: string;
};

export function ForgeKontaktForm({ email, shopName }: ForgeKontaktFormProps) {
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
    <div className="ms-forge-kontakt-form-panel">
      <p className="ms-forge-kontakt-form-eyebrow">Kontaktformular</p>
      <h2 id="forge-kontakt-form-heading" className="ms-forge-kontakt-form-title">
        Termin buchen
      </h2>
      <p className="ms-forge-kontakt-form-lead">
        Schick uns deine Anfrage — wir melden uns schnellstmöglich bei dir.
      </p>

      <form className="ms-forge-kontakt-form" onSubmit={handleSubmit} aria-labelledby="forge-kontakt-form-heading">
        <label className="ms-forge-kontakt-field">
          <span className="ms-forge-kontakt-field-label">Name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder="Vorname Nachname"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="ms-forge-kontakt-input"
          />
        </label>

        <label className="ms-forge-kontakt-field">
          <span className="ms-forge-kontakt-field-label">E-Mail</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="deine@email.com"
            value={formEmail}
            onChange={(event) => setFormEmail(event.target.value)}
            className="ms-forge-kontakt-input"
          />
        </label>

        <label className="ms-forge-kontakt-field">
          <span className="ms-forge-kontakt-field-label">Telefon</span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder="+43 …"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="ms-forge-kontakt-input"
          />
        </label>

        <label className="ms-forge-kontakt-field">
          <span className="ms-forge-kontakt-field-label">Nachricht</span>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Wunschtermin / Nachricht"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="ms-forge-kontakt-input ms-forge-kontakt-input--area"
          />
        </label>

        <div className="ms-forge-kontakt-form-actions">
          <button type="submit" className="ms-forge-kontakt-submit">
            Anfrage senden
          </button>
        </div>
      </form>
    </div>
  );
}
