import { lazy, Suspense, useState } from 'react';
import { Modal } from '../Modal';
import { getMapCenter, hasValidCoords } from '../../lib/geo';
import type { MawkibCity, MawkibCountry } from '../../lib/mawkib-locations';
import { btnSecondary } from '../../lib/styles';

const MawkibLocationMiniMap = lazy(() =>
  import('./MawkibLocationMiniMap').then((m) => ({
    default: m.MawkibLocationMiniMap,
  })),
);

interface MawkibLocationMapTriggerProps {
  latitude?: number | null;
  longitude?: number | null;
  mawkibName?: string;
  className?: string;
  editable?: boolean;
  onPositionChange?: (latitude: number, longitude: number) => void;
  fallbackCountry?: MawkibCountry;
  fallbackCity?: MawkibCity | '';
}

function MapPinIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </svg>
  );
}

function formatCoord(value: number) {
  return value.toFixed(6);
}

export function MawkibLocationMapTrigger({
  latitude,
  longitude,
  mawkibName,
  className = '',
  editable = false,
  onPositionChange,
  fallbackCountry,
  fallbackCity,
}: MawkibLocationMapTriggerProps) {
  const [mapOpen, setMapOpen] = useState(false);

  const hasCoords = hasValidCoords(latitude, longitude);
  const fallback = getMapCenter({
    country: fallbackCountry,
    mawkibCity: fallbackCity,
  });
  const mapLat = hasCoords ? latitude! : fallback.lat;
  const mapLng = hasCoords ? longitude! : fallback.lng;

  if (!editable && !hasCoords) {
    return (
      <div
        className={`rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500 ${className}`}
      >
        موقعیت جغرافیایی ثبت نشده است
      </div>
    );
  }

  const modalTitle = editable
    ? mawkibName
      ? `انتخاب موقعیت «${mawkibName}»`
      : 'انتخاب موقعیت موکب'
    : mawkibName
      ? `موقعیت «${mawkibName}» روی نقشه`
      : 'موقعیت موکب روی نقشه';

  const buttonLabel = editable
    ? hasCoords
      ? 'ویرایش موقعیت روی نقشه'
      : 'انتخاب موقعیت روی نقشه'
    : 'مشاهده موقعیت روی نقشه';

  return (
    <>
      <button
        type="button"
        onClick={() => setMapOpen(true)}
        className={`${btnSecondary} inline-flex w-full items-center justify-center gap-2 sm:w-auto ${className}`}
      >
        <MapPinIcon />
        <span>{buttonLabel}</span>
      </button>

      <Modal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        title={modalTitle}
        size="lg"
      >
        {mapOpen && (
          <div className="space-y-3">
            {editable && (
              <p className="text-xs leading-relaxed text-slate-500">
                مارکر را بکشید یا روی نقشه کلیک کنید تا موقعیت جدید ثبت شود. مقادیر
                عرض و طول جغرافیایی به‌صورت خودکار به‌روز می‌شوند.
              </p>
            )}
            <Suspense
              fallback={
                <div className="flex min-h-72 items-center justify-center text-sm text-slate-500">
                  در حال بارگذاری نقشه...
                </div>
              }
            >
              <MawkibLocationMiniMap
                latitude={mapLat}
                longitude={mapLng}
                mountKey={mapOpen}
                className="mawkib-mini-map-modal"
                editable={editable}
                onPositionChange={editable ? onPositionChange : undefined}
              />
            </Suspense>
            {editable && (
              <p className="text-center font-mono text-[10px] text-slate-500" dir="ltr">
                {formatCoord(mapLat)}, {formatCoord(mapLng)}
              </p>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
