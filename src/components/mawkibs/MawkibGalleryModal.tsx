import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../Modal';
import { resolveAssetUrl } from '../../lib/geo';
import type { Mawkib } from '../../types';

export function mawkibGalleryUrls(mawkib: Pick<Mawkib, 'imageUrl' | 'images'>): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const add = (url?: string | null) => {
    const normalized = url?.trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    urls.push(normalized);
  };

  add(mawkib.imageUrl);
  for (const image of mawkib.images ?? []) {
    add(image.url);
  }

  return urls;
}

function ChevronIcon({ direction }: { direction: 'prev' | 'next' }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      {direction === 'prev' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      )}
    </svg>
  );
}

interface MawkibGalleryModalProps {
  open: boolean;
  onClose: () => void;
  mawkibName: string;
  imageUrls: string[];
  initialIndex?: number;
}

export function MawkibGalleryModal({
  open,
  onClose,
  mawkibName,
  imageUrls,
  initialIndex = 0,
}: MawkibGalleryModalProps) {
  const [index, setIndex] = useState(initialIndex);
  const resolvedUrls = useMemo(
    () => imageUrls.map((url) => resolveAssetUrl(url)),
    [imageUrls],
  );

  useEffect(() => {
    if (open) {
      const safeIndex = Math.min(
        Math.max(initialIndex, 0),
        Math.max(resolvedUrls.length - 1, 0),
      );
      setIndex(safeIndex);
    }
  }, [open, imageUrls, initialIndex, resolvedUrls.length]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setIndex((current) => (current + 1) % resolvedUrls.length);
      }
      if (event.key === 'ArrowLeft') {
        setIndex((current) => (current - 1 + resolvedUrls.length) % resolvedUrls.length);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, resolvedUrls.length]);

  if (resolvedUrls.length === 0) return null;

  const goPrev = () => {
    setIndex((current) => (current - 1 + resolvedUrls.length) % resolvedUrls.length);
  };

  const goNext = () => {
    setIndex((current) => (current + 1) % resolvedUrls.length);
  };

  return (
    <Modal open={open} onClose={onClose} title={`گالری تصاویر — ${mawkibName}`} size="xl">
      <div className="-mx-1 space-y-3 sm:-mx-2">
        <div className="relative flex min-h-[10rem] items-center justify-center px-2 py-3 sm:min-h-[14rem] sm:px-4 sm:py-4">
          <div className="relative flex w-full max-w-full items-center justify-center overflow-hidden rounded-xl bg-slate-900/[0.04] ring-1 ring-slate-200/80">
            <img
              key={resolvedUrls[index]}
              src={resolvedUrls[index]}
              alt={`${mawkibName} — تصویر ${index + 1}`}
              className="mx-auto block max-h-[min(70vh,36rem)] w-auto max-w-full object-contain p-2 sm:p-3"
            />

            {resolvedUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200/80 hover:bg-white sm:h-10 sm:w-10"
                  aria-label="تصویر قبلی"
                >
                  <ChevronIcon direction="prev" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md ring-1 ring-slate-200/80 hover:bg-white sm:h-10 sm:w-10"
                  aria-label="تصویر بعدی"
                >
                  <ChevronIcon direction="next" />
                </button>
                <span className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-medium text-white">
                  {index + 1} / {resolvedUrls.length}
                </span>
              </>
            )}
          </div>
        </div>

        {resolvedUrls.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto px-1 pb-1">
            {resolvedUrls.map((url, thumbIndex) => (
              <button
                key={`${url}-${thumbIndex}`}
                type="button"
                onClick={() => setIndex(thumbIndex)}
                className={`h-11 w-11 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-12 sm:w-12 ${
                  thumbIndex === index
                    ? 'border-[#4a6fa5] ring-2 ring-[#4a6fa5]/25'
                    : 'border-transparent opacity-65 hover:opacity-100'
                }`}
                aria-label={`رفتن به تصویر ${thumbIndex + 1}`}
                aria-current={thumbIndex === index ? 'true' : undefined}
              >
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
