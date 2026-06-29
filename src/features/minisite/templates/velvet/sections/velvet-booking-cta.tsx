import Link from "next/link";

import { velvetReveal } from "@/lib/minisite/velvet-motion";
import type { MinisiteContent } from "@/lib/validations/public-shop";

type VelvetBookingCtaProps = {
  bookHref: string;
  content: MinisiteContent;
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

export function VelvetBookingCta({ bookHref, content }: VelvetBookingCtaProps) {
  const notice = content.booking_notice?.trim() || "Book online — confirmation within seconds.";

  return (
    <section className="ms-velvet-booking-cta" aria-label="Book an appointment">
      {/* Aurora + animated rays */}
      <div className="ms-velvet-booking-cta-bg" aria-hidden>
        <div className="ms-velvet-booking-cta-ray" />
        <div className="ms-velvet-booking-cta-ray" />
        <div className="ms-velvet-booking-cta-ray" />
      </div>

      <div className="ms-velvet-booking-cta-inner">
        <div {...velvetReveal("fade", 0)}>
          {/* Eyebrow label */}
          <p className="ms-velvet-booking-cta-label">Ready to book?</p>

          {/* Decorative ornament line */}
          <div className="ms-velvet-booking-cta-ornament" aria-hidden>
            <div className="ms-velvet-booking-cta-ornament-gem" />
          </div>

          {/* Main headline — large editorial serif */}
          <h2 className="ms-velvet-booking-cta-title ms-velvet-display">
            Book your
            <br />
            <em>perfect set.</em>
          </h2>

          <p className="ms-velvet-booking-cta-sub">{notice}</p>

          <Link href={bookHref} scroll={false} className="ms-velvet-booking-cta-btn">
            <SparkleIcon />
            Book Now
          </Link>

          {/* Subtle hint */}
          <p className="ms-velvet-booking-cta-hint">
            by appointment · online booking available 24/7
          </p>
        </div>
      </div>
    </section>
  );
}
