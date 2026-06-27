import { resolveGoogleMapsEmbedUrl } from "@/lib/minisite/google-maps-url";
import { forgeReveal } from "@/lib/minisite/forge-motion";
import {
  resolveGoogleMapsHrefFromContent,
  resolveKontaktAddress,
  resolveKontaktMapDirections,
} from "@/lib/minisite/nicoles-kontakt-page";
import type { ShopPublicData } from "@/lib/validations/public-shop";

type ForgeKontaktDirectionsProps = {
  data: ShopPublicData;
};

export function ForgeKontaktDirections({ data }: ForgeKontaktDirectionsProps) {
  const content = data.minisite.content;
  const address = resolveKontaktAddress(content);
  const directions = resolveKontaktMapDirections(content);
  const mapsHref = resolveGoogleMapsHrefFromContent(content, address);
  const embedSrc = resolveGoogleMapsEmbedUrl({
    googleMaps: content.links?.google_maps,
    address,
  });
  const heading = "So findest du uns";

  return (
    <aside className="ms-forge-kontakt-directions" aria-labelledby="forge-kontakt-directions-heading">
      <p className="ms-forge-kontakt-directions-eyebrow">Anfahrt</p>
      <h2 id="forge-kontakt-directions-heading" className="ms-forge-kontakt-directions-title">
        {heading}
      </h2>

      <div {...forgeReveal("fade", 120)} className="ms-forge-kontakt-directions-map-shell">
        {embedSrc ? (
          <>
            <iframe
              title={`Standort: ${address}`}
              src={embedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="ms-forge-kontakt-directions-map-frame"
              allowFullScreen
            />
            <div className="ms-forge-kontakt-directions-map-tint" aria-hidden />
            <div className="ms-forge-kontakt-directions-map-pin" aria-hidden>
              <span className="ms-forge-kontakt-directions-map-pin-dot" />
              <span className="ms-forge-kontakt-directions-map-pin-tail" />
            </div>
          </>
        ) : (
          <div className="ms-forge-kontakt-directions-map-fallback" aria-hidden>
            <span className="ms-forge-kontakt-directions-pin">◆</span>
            <span>{address}</span>
          </div>
        )}
      </div>

      <p {...forgeReveal("up", 180)} className="ms-forge-kontakt-directions-text">
        {directions}
      </p>

      <a
        {...forgeReveal("up", 240)}
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="ms-forge-kontakt-directions-cta"
      >
        In Google Maps öffnen
      </a>
    </aside>
  );
}
