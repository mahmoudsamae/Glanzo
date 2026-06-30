import { velvetReveal } from "@/lib/minisite/velvet-motion";
import { VELVET_SECTION_META } from "@/lib/minisite/velvet-sections";
import type { VelvetI18n } from "@/lib/minisite/velvet-i18n";
import type { ShopPublicData } from "@/lib/validations/public-shop";
import { WEEKDAY_ORDER } from "@/lib/validations/shop";

const VELVET_CONTACT_ID = "ms-velvet-contact";

type VelvetContactSectionProps = {
  data: ShopPublicData;
  shopSlug: string;
  preview?: boolean;
  i18n: VelvetI18n;
};

function LocationIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4">
      <path d="M10 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2.5C7.239 2.5 5 4.739 5 7.5c0 3.75 5 10 5 10s5-6.25 5-10c0-2.761-2.239-5-5-5Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4">
      <path d="M3.5 5.5a2 2 0 0 1 2-2H6a1 1 0 0 1 .973.764l.75 3a1 1 0 0 1-.285.96L6.5 9.17A10.025 10.025 0 0 0 10.83 13.5l.944-.938a1 1 0 0 1 .96-.285l3 .75A1 1 0 0 1 16.5 14v.5a2 2 0 0 1-2 2c-5.523 0-10-4.477-10-10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4">
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m2.5 6.5 7.5 5 7.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const TODAY_IDX = new Date().getDay(); // 0=Sun, 1=Mon, …
const WEEKDAY_ORDER_IDX: Record<string, number> = {
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
};

export function VelvetContactSection({ data, shopSlug, preview = false, i18n }: VelvetContactSectionProps) {
  const content = data.minisite.content;
  if (content.show?.location === false) return null;

  const meta = VELVET_SECTION_META.contact;
  const eyebrow = content.sections?.contact?.eyebrow?.trim() || meta.defaults.eyebrow || i18n.contact.eyebrow;
  const title = content.sections?.contact?.title?.trim() || meta.defaults.title || i18n.contact.title;

  const address = content.address?.trim();
  const phone = content.phone?.trim();
  const email = content.email?.trim();
  const openingHours = data.shop.opening_hours;

  const hasContactInfo = !!(address || phone || email);

  return (
    <section id={VELVET_CONTACT_ID} className="ms-velvet-contact" aria-label="Contact & Hours">
      <div className="ms-velvet-contact-inner">
        <header {...velvetReveal("fade", 0, "ms-velvet-section-header")}>
          <p className="ms-velvet-eyebrow">
            <span className="ms-velvet-eyebrow-ornament" aria-hidden />
            {eyebrow}
            <span className="ms-velvet-eyebrow-ornament" aria-hidden />
          </p>
          <h2 className="ms-velvet-section-title ms-velvet-display">{title}</h2>
        </header>

        {hasContactInfo ? (
          /* Two-column layout when contact info exists */
          <div className="ms-velvet-contact-grid">
            <div {...velvetReveal("left", 80)}>
              {address ? (
                <div className="ms-velvet-contact-item">
                  <div className="ms-velvet-contact-icon-wrap"><LocationIcon /></div>
                  <div>
                    <p className="ms-velvet-contact-label">{i18n.contact.address}</p>
                    <p className="ms-velvet-contact-value">{address}</p>
                  </div>
                </div>
              ) : null}
              {phone ? (
                <div className="ms-velvet-contact-item">
                  <div className="ms-velvet-contact-icon-wrap"><PhoneIcon /></div>
                  <div>
                    <p className="ms-velvet-contact-label">{i18n.contact.phone}</p>
                    <p className="ms-velvet-contact-value"><a href={`tel:${phone}`}>{phone}</a></p>
                  </div>
                </div>
              ) : null}
              {email ? (
                <div className="ms-velvet-contact-item">
                  <div className="ms-velvet-contact-icon-wrap"><MailIcon /></div>
                  <div>
                    <p className="ms-velvet-contact-label">{i18n.contact.email}</p>
                    <p className="ms-velvet-contact-value"><a href={`mailto:${email}`}>{email}</a></p>
                  </div>
                </div>
              ) : null}
            </div>
            <div {...velvetReveal("right", 120)}>
              <HoursPanel openingHours={openingHours} i18n={i18n} />
            </div>
          </div>
        ) : (
          /* Full-width centered layout when only hours exist */
          <div {...velvetReveal("fade", 80, "ms-velvet-contact-grid ms-velvet-contact-grid--hours-only")}>
            <div>
              <p className="ms-velvet-contact-intro-text ms-velvet-display">
                {i18n.contact.introText}
              </p>
            </div>
            <div>
              <HoursPanel openingHours={openingHours} i18n={i18n} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

type OpeningHoursMap = ShopPublicData["shop"]["opening_hours"];

function HoursPanel({ openingHours, i18n }: { openingHours: OpeningHoursMap; i18n: VelvetI18n }) {
  return (
    <div className="ms-velvet-hours-panel">
      <h3 className="ms-velvet-hours-title ms-velvet-display">{i18n.contact.hoursTitle}</h3>
      {WEEKDAY_ORDER.map((key) => {
        const dayEntry = openingHours[key];
        const isClosed = !dayEntry;
        const dayIndex = WEEKDAY_ORDER_IDX[key] ?? -1;
        const isToday = dayIndex === TODAY_IDX;
        const timeStr = isClosed
          ? i18n.contact.closed
          : `${dayEntry.open.slice(0, 5)} – ${dayEntry.close.slice(0, 5)}`;

        return (
          <div key={key} className="ms-velvet-hours-row">
            <span className={`ms-velvet-hours-day ${isToday ? "ms-velvet-hours-day--today" : ""}`}>
              {i18n.contact.weekdays[key] ?? key}
              {isToday ? " ·" : ""}
            </span>
            <span className={`ms-velvet-hours-time ${isClosed ? "ms-velvet-hours-time--closed" : "ms-velvet-display"}`}>
              {timeStr}
            </span>
          </div>
        );
      })}
    </div>
  );
}
