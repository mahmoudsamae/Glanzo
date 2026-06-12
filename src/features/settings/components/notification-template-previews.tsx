import type { NotificationTemplate } from "@/lib/notifications/types";
import {
  DUMMY_NOTIFICATION_CONTEXT,
  renderNotificationTemplate,
} from "@/server/modules/notifications/templates";

const PREVIEW_TEMPLATES: { key: NotificationTemplate; label: string }[] = [
  { key: "booking_confirmed", label: "Buchungsbestätigung (Kunde)" },
  { key: "reminder_24h", label: "Erinnerung (Kunde)" },
  { key: "booking_cancelled", label: "Stornierung (Kunde)" },
  { key: "owner_new_booking", label: "Neue Buchung (Inhaber)" },
];

export function NotificationTemplatePreviews() {
  return (
    <section className="space-y-[var(--space-3)]">
      <h2 className="text-sm font-medium text-[var(--text-0)]">Vorlagen</h2>
      <p className="text-xs text-[var(--text-2)]">
        Vorschau mit Beispieldaten — entspricht dem Versand.
      </p>
      <div className="space-y-[var(--space-2)]">
        {PREVIEW_TEMPLATES.map((item) => {
          const rendered = renderNotificationTemplate(item.key, DUMMY_NOTIFICATION_CONTEXT);
          return (
            <details
              key={item.key}
              className="rounded-md border border-[var(--ink-3)] bg-[var(--ink-1)] px-[var(--space-4)] py-[var(--space-3)]"
            >
              <summary className="cursor-pointer text-sm font-medium text-[var(--text-0)]">
                {item.label} — {rendered.subject}
              </summary>
              <div
                className="mt-[var(--space-3)] overflow-auto rounded border border-[var(--ink-3)] bg-white p-[var(--space-3)] text-sm"
                dangerouslySetInnerHTML={{ __html: rendered.html }}
              />
            </details>
          );
        })}
      </div>
    </section>
  );
}
