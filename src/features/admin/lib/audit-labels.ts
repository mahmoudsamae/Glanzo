export type AuditTone = "brass" | "ok" | "warn" | "bad" | "neutral";

export type AuditFact = {
  label: string;
  value: string;
};

const ACTION_LABELS: Record<string, string> = {
  "shop.created": "Shop erstellt",
  "shop.suspended": "Shop suspendiert",
  "shop.reactivated": "Shop reaktiviert",
  "shop.reminders_toggled": "Erinnerungen geändert",
  "minisite.updated": "Mini-Site bearbeitet",
  "invite.created": "Einladung erstellt",
  "invite.revoked": "Einladung widerrufen",
  "invite.owner_created": "Owner-Einladung ausgestellt",
  "owner.email_changed": "Inhaber-E-Mail geändert",
  "owner.password_set_by_platform": "Inhaber-Passwort gesetzt",
  "service.created": "Service angelegt",
  "service.price_changed": "Preis geändert",
  "service.archived": "Service archiviert",
  "appointment.walk_in": "Walk-in gebucht",
  "appointment.moved": "Termin verschoben",
  "platform.support_view": "Support-Ansicht geöffnet",
};

const ENTITY_LABELS: Record<string, string> = {
  shop: "Shop",
  service: "Service",
  staff_invite: "Einladung",
  minisite: "Mini-Site",
  appointment: "Termin",
  notification: "Benachrichtigung",
  profile: "Inhaber-Konto",
};

const VIEW_LABELS: Record<string, string> = {
  today_histogram: "Heute-Übersicht",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Inhaber",
  barber: "Barber",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Aktiv",
  suspended: "Suspendiert",
};

export function formatAuditAction(action: string | null | undefined): string {
  if (!action) {
    return "Unbekannte Aktion";
  }
  return ACTION_LABELS[action] ?? action.replaceAll(".", " · ");
}

export function formatAuditEntity(entity: string | null | undefined): string {
  if (!entity) {
    return "";
  }
  return ENTITY_LABELS[entity] ?? entity;
}

export function getAuditTone(action: string | null | undefined): AuditTone {
  if (!action) {
    return "neutral";
  }
  if (
    action.includes("suspended") ||
    action.includes("archived") ||
    action.includes("revoked")
  ) {
    return "bad";
  }
  if (
    action.includes("created") ||
    action.includes("reactivated") ||
    action === "owner.email_changed"
  ) {
    return "ok";
  }
  if (
    action.includes("updated") ||
    action.includes("changed") ||
    action.includes("moved") ||
    action === "owner.password_set_by_platform"
  ) {
    return "warn";
  }
  if (action.startsWith("platform.") || action.startsWith("shop.")) {
    return "brass";
  }
  return "neutral";
}

export function formatAuditTime(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("de-DE", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function pushUniqueFact(facts: AuditFact[], label: string, value: string) {
  if (!value.trim()) {
    return;
  }
  if (facts.some((fact) => fact.label === label && fact.value === value)) {
    return;
  }
  facts.push({ label, value });
}

export function describeAuditFacts(action: string, diff: unknown): AuditFact[] {
  const record = asRecord(diff);
  if (!record) {
    return [];
  }

  const facts: AuditFact[] = [];

  if (typeof record.reason === "string" && record.reason.trim()) {
    pushUniqueFact(facts, "Grund", record.reason.trim());
  }

  if (typeof record.email === "string" && record.email.trim()) {
    pushUniqueFact(facts, "E-Mail", record.email.trim());
  }

  if (typeof record.role === "string") {
    pushUniqueFact(facts, "Rolle", ROLE_LABELS[record.role] ?? record.role);
  }

  if (typeof record.view === "string") {
    pushUniqueFact(facts, "Ansicht", VIEW_LABELS[record.view] ?? record.view);
  }

  if (typeof record.slug === "string") {
    pushUniqueFact(facts, "Slug", record.slug);
  }

  const before = asRecord(record.before);
  const after = asRecord(record.after);

  if (before) {
    if (typeof before.email === "string") {
      pushUniqueFact(facts, "E-Mail vorher", before.email);
    }
    if (typeof before.status === "string") {
      pushUniqueFact(facts, "Status vorher", STATUS_LABELS[before.status] ?? before.status);
    }
  }

  if (after) {
    if (typeof after.email === "string") {
      pushUniqueFact(facts, "E-Mail neu", after.email);
    }
    if (typeof after.status === "string") {
      pushUniqueFact(facts, "Status neu", STATUS_LABELS[after.status] ?? after.status);
    }
  }

  if (action === "minisite.updated" && before && after) {
    if (before.template !== after.template) {
      pushUniqueFact(
        facts,
        "Vorlage",
        `${String(before.template ?? "—")} → ${String(after.template ?? "—")}`,
      );
    }
    if (before.accent_hex !== after.accent_hex) {
      pushUniqueFact(facts, "Akzentfarbe", "Geändert");
    }
    if (JSON.stringify(before.content) !== JSON.stringify(after.content)) {
      pushUniqueFact(facts, "Inhalt", "Texte oder Bilder aktualisiert");
    }
  }

  if (action === "service.price_changed" && before && after) {
    if (before.price_cents !== after.price_cents) {
      pushUniqueFact(
        facts,
        "Preis",
        `${String(before.price_cents ?? "—")} → ${String(after.price_cents ?? "—")} ct`,
      );
    }
  }

  if (action === "owner.password_set_by_platform") {
    pushUniqueFact(facts, "Passwort", "Neu gesetzt (nicht im Log gespeichert)");
  }

  if (action === "shop.reminders_toggled" && before && after) {
    const beforeEnabled = before.reminders_enabled ? "An" : "Aus";
    const afterEnabled = after.reminders_enabled ? "An" : "Aus";
    pushUniqueFact(facts, "Erinnerungen", `${beforeEnabled} → ${afterEnabled}`);
  }

  return facts;
}

export function summarizeAuditDiff(diff: unknown): string | null {
  const facts = describeAuditFacts("", diff);
  if (facts.length === 0) {
    return null;
  }
  return facts
    .slice(0, 2)
    .map((fact) => `${fact.label}: ${fact.value}`)
    .join(" · ");
}
