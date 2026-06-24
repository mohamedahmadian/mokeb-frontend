import { useState } from 'react';

export const MAWKIB_DEFAULT_IMAGE = '/images/mawkib-default.svg';

interface MawkibThumbnailProps {
  imageUrl?: string | null;
  name: string;
  className?: string;
}

export function MawkibThumbnail({ imageUrl, name, className = '' }: MawkibThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl?.trim() && !failed ? imageUrl.trim() : MAWKIB_DEFAULT_IMAGE;

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
