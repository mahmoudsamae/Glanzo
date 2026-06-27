import Image from "next/image";
import Link from "next/link";

import { formatPriceCents } from "@/lib/minisite/format-price";
import { buildPublicBookHref } from "@/lib/booking/public-book-href";
import type { ShopPublicData } from "@/lib/validations/public-shop";

import { shopMediaPublicUrl } from "../../../lib/media-url";
import { ForgeShineFrame } from "../forge-shine-frame";

type ForgeService = ShopPublicData["services"][number];

type ForgeServiceCardProps = {
  service: ForgeService;
  shopSlug: string;
  preview?: boolean;
  suspended?: boolean;
  page?: boolean;
};

export function ForgeServiceCard({
  service,
  shopSlug,
  preview = false,
  suspended = false,
  page = false,
}: ForgeServiceCardProps) {
  const imagePath = service.image_path?.trim();
  const showPrice = service.show_price !== false;
  const description = service.description?.trim();
  const bookHref = buildPublicBookHref(shopSlug, { serviceId: service.id });
  const bookingDisabled = preview || suspended;
  const HeadingTag = page ? "h2" : "h3";

  return (
    <ForgeShineFrame
      variant="card"
      className={`ms-forge-service-card${page ? " ms-forge-service-card--page" : ""}`}
    >
      <div className="ms-forge-service-card-media">
        {imagePath ? (
          <Image
            src={shopMediaPublicUrl(imagePath)}
            alt=""
            fill
            sizes="(min-width:1024px) 320px, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="ms-forge-service-card-placeholder" aria-hidden />
        )}
      </div>

      <div className="ms-forge-service-card-body">
        <div className="ms-forge-service-card-head">
          <HeadingTag className="ms-forge-service-card-title">{service.name}</HeadingTag>
          <div className="ms-forge-service-card-title-rule" aria-hidden />
        </div>

        {description ? <p className="ms-forge-service-card-desc">{description}</p> : null}

        <div className="ms-forge-service-card-foot">
          <div className="ms-forge-service-card-price-block">
            {showPrice ? (
              <span className="ms-forge-service-card-price tabular-nums">{formatPriceCents(service.price_cents)}</span>
            ) : null}
            <span className="ms-forge-service-card-meta tabular-nums">{service.duration_min} Min.</span>
          </div>

          {bookingDisabled ? (
            <span className="ms-forge-service-card-book ms-forge-service-card-book--disabled" aria-disabled="true">
              Buchen
            </span>
          ) : (
            <Link href={bookHref} scroll={false} className="ms-forge-service-card-book">
              Buchen
            </Link>
          )}
        </div>
      </div>
    </ForgeShineFrame>
  );
}
