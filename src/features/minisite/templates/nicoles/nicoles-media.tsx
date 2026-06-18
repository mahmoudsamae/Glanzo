import Image from "next/image";

import { getMinisiteAnchors } from "@/lib/minisite/template-anchors";
import { getNicolesSectionField, NICOLES_SECTION_META } from "@/lib/minisite/nicoles-sections";
import { resolveNicolesGalleryImage } from "@/lib/minisite/nicoles-stock-images";
import type { MinisiteContent } from "@/lib/validations/public-shop";

import { minisiteImageUrl } from "../../lib/media-url";

type NicolesPhotoProps = {
  path?: string;
  alt?: string;
  className?: string;
  color?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function NicolesPhoto({
  path,
  alt = "",
  className = "",
  color = false,
  priority = false,
  sizes = "50vw",
}: NicolesPhotoProps) {
  if (path) {
    return (
      <Image
        src={minisiteImageUrl(path)}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${color ? "ms-nicoles-photo-color" : "ms-nicoles-photo"} ${className}`.trim()}
      />
    );
  }

  return <div className={`ms-nicoles-photo-placeholder ${className}`.trim()} aria-hidden />;
}

export function nicolesHeroPhotos(content: MinisiteContent): [string, string] {
  const blockPaths = content.sections?.hero?.image_paths;
  if (blockPaths?.length) {
    return [
      blockPaths[0] ?? resolveNicolesGalleryImage(content, 0),
      blockPaths[1] ?? resolveNicolesGalleryImage(content, 1),
    ];
  }
  return [resolveNicolesGalleryImage(content, 0), resolveNicolesGalleryImage(content, 1)];
}

export function nicolesAboutPhotos(content: MinisiteContent): [string, string] {
  const blockPaths = content.sections?.about?.image_paths;
  if (blockPaths?.length) {
    return [
      blockPaths[0] ?? resolveNicolesGalleryImage(content, 2),
      blockPaths[1] ?? resolveNicolesGalleryImage(content, 3),
    ];
  }
  return [resolveNicolesGalleryImage(content, 2), resolveNicolesGalleryImage(content, 3)];
}

export function nicolesHeroCopy(content: MinisiteContent, shopName: string) {
  const meta = NICOLES_SECTION_META.hero;
  return {
    headline: getNicolesSectionField(content, "hero", "title", meta.defaults.title ?? shopName),
    badgeTiny: getNicolesSectionField(content, "hero", "badge_tiny", meta.defaults.badge_tiny ?? ""),
    badgeMedium: getNicolesSectionField(content, "hero", "badge_medium", meta.defaults.badge_medium ?? ""),
    badgeLarge: getNicolesSectionField(content, "hero", "badge_large", meta.defaults.badge_large ?? ""),
    logoUrl: content.logo_path ? minisiteImageUrl(content.logo_path) : null,
    aboutAnchor: `#${getMinisiteAnchors("nicoles").about}`,
  };
}
