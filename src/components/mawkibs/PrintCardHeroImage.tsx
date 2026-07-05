import { resolveMawkibImageUrl } from './MawkibThumbnail';

interface PrintCardHeroImageProps {
  imageUrl?: string | null;
  className?: string;
}

/** Hero image for print/download cards — use <img> instead of CSS background for reliable output. */
export function PrintCardHeroImage({
  imageUrl,
  className = 'print-card-hero__image',
}: PrintCardHeroImageProps) {
  return (
    <img
      src={resolveMawkibImageUrl(imageUrl)}
      alt=""
      aria-hidden
      className={className}
      loading="eager"
      decoding="sync"
    />
  );
}

export const PRINT_CARD_HERO_IMAGE_CSS = `
  .print-card-hero__image,
  .mawkib-card__hero-image,
  .pilgrim-card__hero-image {
    position: absolute;
    inset: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;
