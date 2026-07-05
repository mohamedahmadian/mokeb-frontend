import { useState } from 'react';
import { resolveAssetUrl } from '../../lib/geo';
import type { Mawkib } from '../../types';
import { MawkibGalleryModal, mawkibGalleryUrls } from './MawkibGalleryModal';

interface MawkibGallerySectionProps {
  mawkib: Pick<Mawkib, 'name' | 'imageUrl' | 'images'>;
}

export function MawkibGallerySection({ mawkib }: MawkibGallerySectionProps) {
  const urls = mawkibGalleryUrls(mawkib);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  if (urls.length === 0) return null;

  const openAt = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap gap-1.5 py-1">
        {urls.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => openAt(index)}
            className="group h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50 shadow-sm transition hover:border-[#c5d4e8] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a6fa5] sm:h-14 sm:w-14"
            aria-label={`مشاهده تصویر ${index + 1} از ${urls.length}`}
          >
            <img
              src={resolveAssetUrl(url)}
              alt={`${mawkib.name} — تصویر ${index + 1}`}
              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <MawkibGalleryModal
        open={open}
        onClose={() => setOpen(false)}
        mawkibName={mawkib.name}
        imageUrls={urls}
        initialIndex={activeIndex}
      />
    </>
  );
}
