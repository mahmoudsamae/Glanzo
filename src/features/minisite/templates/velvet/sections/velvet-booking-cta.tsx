import Link from "next/link";

import { velvetReveal } from "@/lib/minisite/velvet-motion";
import type { VelvetI18n } from "@/lib/minisite/velvet-i18n";
import type { MinisiteContent } from "@/lib/validations/public-shop";

type VelvetBookingCtaProps = {
  bookHref: string;
  content: MinisiteContent;
  i18n: VelvetI18n;
};

function SparkleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4 shrink-0">
      <path
        d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.697 4.697l1.414 1.414M13.889 13.889l1.414 1.414M4.697 15.303l1.414-1.414M13.889 6.111l1.414-1.414M10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VelvetBookingCta({ bookHref, content, i18n }: VelvetBookingCtaProps) {
  const notice = content.booking_notice?.trim() || i18n.booking.notice;

  return (
    <section className="ms-velvet-booking-cta" aria-label={i18n.booking.cta}>
      {/* Aurora + animated rays */}
      <div className="ms-velvet-booking-cta-bg" aria-hidden>
        <div className="ms-velvet-booking-cta-ray" />
        <div className="ms-velvet-booking-cta-ray" />
        <div className="ms-velvet-booking-cta-ray" />
      </div>

      <div className="ms-velvet-booking-cta-inner">
        <div {...velvetReveal("fade", 0)}>
          <p className="ms-velvet-booking-cta-label">{i18n.booking.label}</p>

          <div className="ms-velvet-booking-cta-ornament" aria-hidden>
            <div className="ms-velvet-booking-cta-ornament-gem" />
          </div>

          <h2 className="ms-velvet-booking-cta-title ms-velvet-display">
            {i18n.booking.title}
            <br />
            <em>{i18n.booking.titleEm}</em>
          </h2>

          <p className="ms-velvet-booking-cta-sub">{notice}</p>

          <Link href={bookHref} scroll={false} className="ms-velvet-booking-cta-btn">
            <SparkleIcon />
            {i18n.booking.cta}
          </Link>

          <p className="ms-velvet-booking-cta-hint">{i18n.booking.hint}</p>
        </div>
      </div>
    </section>
  );
}
