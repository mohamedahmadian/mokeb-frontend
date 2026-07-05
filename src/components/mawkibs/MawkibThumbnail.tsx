import { useState } from 'react';
import { resolveAssetUrl } from '../../lib/geo';
import mokebDefaultImage from '../../assets/mokebback.png';

export const MAWKIB_DEFAULT_IMAGE = mokebDefaultImage;

export function resolveMawkibImageUrl(
  imageUrl?: string | null,
  useDefault = true,
): string {
  const resolved = imageUrl?.trim() ? resolveAssetUrl(imageUrl.trim()) : '';
  if (resolved) return resolved;
  return useDefault ? MAWKIB_DEFAULT_IMAGE : '';
}

interface MawkibThumbnailProps {
  imageUrl?: string | null;
  name: string;
  className?: string;
}

export function MawkibThumbnail({ imageUrl, name, className = '' }: MawkibThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const src =
    imageUrl?.trim() && !failed
      ? resolveAssetUrl(imageUrl.trim())
      : MAWKIB_DEFAULT_IMAGE;

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-[#f0f4fa] ring-1 ring-slate-200/80 ${className}`}
    >
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
}

export function MawkibLogoCircle({
  imageUrl,
  name,
  className = 'h-10 w-10',
}: {
  imageUrl?: string | null;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src =
    imageUrl?.trim() && !failed
      ? resolveAssetUrl(imageUrl.trim())
      : MAWKIB_DEFAULT_IMAGE;

  return (
    <img
      src={src}
      alt={`لوگوی ${name}`}
      className={`shrink-0 rounded-full object-cover shadow-md shadow-slate-300/60 ring-2 ring-white ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export function MawkibNameWithLogo({
  name,
  imageUrl,
  nameClassName = '',
}: {
  name: string;
  imageUrl?: string | null;
  nameClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <MawkibLogoCircle imageUrl={imageUrl} name={name} />
      <span className={nameClassName}>{name}</span>
    </span>
  );
}
