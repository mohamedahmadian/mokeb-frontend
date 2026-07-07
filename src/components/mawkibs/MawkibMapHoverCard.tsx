import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useMap } from 'react-leaflet';
import { formatCapacityFraction, mawkibAvailableFemale, mawkibAvailableMale } from '../../lib/capacity';
import {
  mawkibCityLabel,
  mawkibCountryLabel,
} from '../../lib/mawkib-locations';
import type { Mawkib } from '../../types';
import { MAWKIB_AMENITY_FIELDS } from './MawkibExtraFields';
import { MawkibReservationTypeBadges } from './MawkibReservationTypeBadges';
import { MawkibThumbnail } from './MawkibThumbnail';

function SvgIcon({
  className = 'h-3.5 w-3.5',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const icons = {
  mawkib: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </SvgIcon>
  ),
  location: (
    <SvgIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </SvgIcon>
  ),
  phone: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </SvgIcon>
  ),
  owner: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </SvgIcon>
  ),
  address: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-1.5m-15-3.75h9v-3.375c0-.621-.504-1.125-1.125-1.125H5.625c-.621 0-1.125.504-1.125 1.125v3.375m0 0h-.375A1.125 1.125 0 013 17.625v-5.25A1.125 1.125 0 014.125 11.25h15.75A1.125 1.125 0 0121 12.375v5.25A1.125 1.125 0 0119.875 18.75h-.375"
      />
    </SvgIcon>
  ),
  male: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </SvgIcon>
  ),
  female: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </SvgIcon>
  ),
};

function IconBadge({ icon }: { icon: ReactNode }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0f4fa] text-[#4a6fa5]">
      {icon}
    </span>
  );
}

function InfoRow({
  icon,
  label,
  value,
  dir,
  mono = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  dir?: 'ltr' | 'rtl';
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <IconBadge icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-500">{label}</p>
        <p
          className={`text-xs font-medium text-slate-800 ${mono ? 'font-mono' : ''}`}
          dir={dir}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoRowGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-2 gap-y-2">{children}</div>;
}

interface MawkibMapHoverCardProps {
  mawkib: Mawkib;
  detailPath: (id: number) => string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function MawkibMapHoverCard({
  mawkib,
  detailPath,
  onMouseEnter,
  onMouseLeave,
}: MawkibMapHoverCardProps) {
  const availableMale = mawkibAvailableMale(mawkib);
  const availableFemale = mawkibAvailableFemale(mawkib);
  const ownerName = mawkib.owner?.fullName?.trim();
  const ownerPhone = mawkib.owner?.mobileNumber?.trim();
  const mawkibPhone = mawkib.phoneNumber?.trim();
  const locationLabel = [
    mawkibCountryLabel(mawkib.country),
    mawkib.mawkibCity ? mawkibCityLabel(mawkib.mawkibCity) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const activeAmenities = MAWKIB_AMENITY_FIELDS.filter((f) => mawkib[f.key]);

  return (
    <div
      className="mawkib-map-hover-card w-64 rounded-xl border border-slate-200 bg-white p-3 text-right shadow-xl ring-1 ring-black/5"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-start gap-2.5">
        <div className="relative shrink-0">
          <div
            className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-[#c5d4e8]/60 to-[#e8eef6]/30 blur-[1px]"
            aria-hidden
          />
          <MawkibThumbnail
            imageUrl={mawkib.imageUrl}
            name={mawkib.name}
            className="relative h-14 w-14 rounded-lg shadow-md shadow-slate-300/50 ring-2 ring-white"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug text-slate-800">{mawkib.name}</p>
          <div className="mt-1">
            <MawkibReservationTypeBadges mawkib={mawkib} />
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        {(locationLabel || mawkibPhone) && (
          <InfoRowGrid>
            {locationLabel && (
              <div className={mawkibPhone ? undefined : "col-span-2"}>
                <InfoRow
                  icon={icons.location}
                  label="کشور / شهر"
                  value={locationLabel}
                />
              </div>
            )}
            {mawkibPhone && (
              <div className={locationLabel ? undefined : "col-span-2"}>
                <InfoRow
                  icon={icons.phone}
                  label="تلفن موکب"
                  value={mawkibPhone}
                  dir="ltr"
                  mono
                />
              </div>
            )}
          </InfoRowGrid>
        )}
        {(ownerName || ownerPhone) && (
          <InfoRowGrid>
            {ownerName && (
              <div className={ownerPhone ? undefined : "col-span-2"}>
                <InfoRow icon={icons.owner} label="مسئول موکب" value={ownerName} />
              </div>
            )}
            {ownerPhone && (
              <div className={ownerName ? undefined : "col-span-2"}>
                <InfoRow
                  icon={icons.phone}
                  label="موبایل مسئول"
                  value={ownerPhone}
                  dir="ltr"
                  mono
                />
              </div>
            )}
          </InfoRowGrid>
        )}
        {mawkib.address?.trim() && (
          <InfoRow
            icon={icons.address}
            label="آدرس"
            value={
              <span className="line-clamp-2 leading-relaxed">{mawkib.address}</span>
            }
          />
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <span className="text-[#4a6fa5]">{icons.male}</span>
          <span>آقایان:</span>
          <span className="font-semibold text-emerald-600">
            {formatCapacityFraction(availableMale, mawkib.maleCapacity)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
          <span className="text-[#4a6fa5]">{icons.female}</span>
          <span>بانوان:</span>
          <span className="font-semibold text-emerald-600">
            {formatCapacityFraction(availableFemale, mawkib.femaleCapacity)}
          </span>
        </div>
      </div>

      {activeAmenities.length > 0 && (
        <div className="mt-2 border-t border-slate-100 pt-2">
          <p className="mb-1 text-[9px] text-slate-400">امکانات</p>
          <div className="flex flex-wrap gap-1">
            {activeAmenities.map(({ key, label }) => (
              <span
                key={key}
                className="inline-flex items-center rounded bg-[#f0f4fa] px-1.5 py-0.5 text-[9px] leading-tight font-medium text-[#3d5d8a] ring-1 ring-[#e8eef6]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <Link
        to={detailPath(mawkib.id)}
        className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#3d5d8a] px-3 py-2 text-xs font-bold text-white shadow-sm ring-1 ring-[#2f4a6e]/30 transition hover:bg-[#2f4a6e]"
      >
        مشاهده جزئیات
      </Link>

      {mawkib.latitude != null && mawkib.longitude != null && (
        <p
          className="mt-2 text-center font-mono text-[9px] leading-none text-slate-400"
          dir="ltr"
        >
          {mawkib.latitude.toFixed(5)}, {mawkib.longitude.toFixed(5)}
        </p>
      )}
    </div>
  );
}

interface HoverCardLayout {
  left: number;
  top: number;
  transform: string;
}

const CARD_ESTIMATE = { width: 256, height: 340 };
const HOVER_GAP = 14;
const EDGE_PADDING = 10;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function computeHoverLayout(
  markerX: number,
  markerY: number,
  cardWidth: number,
  cardHeight: number,
  bounds: { top: number; bottom: number; left: number; right: number },
): HoverCardLayout {
  const halfW = cardWidth / 2;
  const left = clamp(
    markerX,
    bounds.left + EDGE_PADDING + halfW,
    bounds.right - EDGE_PADDING - halfW,
  );

  const spaceAbove = markerY - bounds.top - EDGE_PADDING;
  const spaceBelow = bounds.bottom - markerY - EDGE_PADDING;
  const preferAbove =
    spaceAbove >= cardHeight + HOVER_GAP ||
    (spaceAbove >= spaceBelow && spaceAbove >= cardHeight * 0.45);

  if (preferAbove) {
    let top = markerY - HOVER_GAP;
    const cardTop = top - cardHeight;
    if (cardTop < bounds.top + EDGE_PADDING) {
      if (spaceBelow >= spaceAbove) {
        top = markerY + HOVER_GAP;
        const cardBottom = top + cardHeight;
        if (cardBottom > bounds.bottom - EDGE_PADDING) {
          top = bounds.bottom - EDGE_PADDING - cardHeight;
        }
        return { left, top, transform: 'translate(-50%, 0)' };
      }
      top = bounds.top + EDGE_PADDING + cardHeight;
    }
    return { left, top, transform: 'translate(-50%, -100%)' };
  }

  let top = markerY + HOVER_GAP;
  const cardBottom = top + cardHeight;
  if (cardBottom > bounds.bottom - EDGE_PADDING) {
    if (spaceAbove > spaceBelow) {
      top = markerY - HOVER_GAP;
      const cardTop = top - cardHeight;
      if (cardTop < bounds.top + EDGE_PADDING) {
        top = bounds.top + EDGE_PADDING + cardHeight;
      }
      return { left, top, transform: 'translate(-50%, -100%)' };
    }
    top = bounds.bottom - EDGE_PADDING - cardHeight;
  }
  return { left, top, transform: 'translate(-50%, 0)' };
}

function getMapBounds(map: ReturnType<typeof useMap>) {
  const mapRect = map.getContainer().getBoundingClientRect();

  return {
    top: Math.max(mapRect.top, 0),
    bottom: Math.min(mapRect.bottom, window.innerHeight),
    left: Math.max(mapRect.left, 0),
    right: Math.min(mapRect.right, window.innerWidth),
  };
}

interface MawkibMapHoverOverlayProps {
  mawkib: Mawkib;
  position: [number, number];
  detailPath: (id: number) => string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function MawkibMapHoverOverlay({
  mawkib,
  position,
  detailPath,
  onMouseEnter,
  onMouseLeave,
}: MawkibMapHoverOverlayProps) {
  const map = useMap();
  const cardRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<HoverCardLayout | null>(null);

  const updateLayout = () => {
    const point = map.latLngToContainerPoint(position);
    const mapRect = map.getContainer().getBoundingClientRect();
    const markerX = mapRect.left + point.x;
    const markerY = mapRect.top + point.y;
    const cardWidth = cardRef.current?.offsetWidth ?? CARD_ESTIMATE.width;
    const cardHeight = cardRef.current?.offsetHeight ?? CARD_ESTIMATE.height;
    const bounds = getMapBounds(map);

    setLayout(
      computeHoverLayout(markerX, markerY, cardWidth, cardHeight, bounds),
    );
  };

  useLayoutEffect(() => {
    updateLayout();
    const cardEl = cardRef.current;
    const observer =
      cardEl && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateLayout)
        : null;
    observer?.observe(cardEl!);

    map.on('move zoom zoomend moveend resize', updateLayout);
    window.addEventListener('resize', updateLayout);
    window.addEventListener('scroll', updateLayout, true);

    return () => {
      observer?.disconnect();
      map.off('move zoom zoomend moveend resize', updateLayout);
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('scroll', updateLayout, true);
    };
  }, [map, position, mawkib.id]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={cardRef}
      className="mawkib-map-hover-portal pointer-events-auto fixed"
      style={{
        left: layout?.left ?? -9999,
        top: layout?.top ?? -9999,
        transform: layout?.transform ?? 'translate(-50%, -100%)',
        visibility: layout ? 'visible' : 'hidden',
        zIndex: 10000,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <MawkibMapHoverCard
        mawkib={mawkib}
        detailPath={detailPath}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    </div>,
    document.body,
  );
}

export function useHoverDelay(delayMs = 120) {
  const timerRef = useRef<number | null>(null);

  const clear = () => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const schedule = (action: () => void) => {
    clear();
    timerRef.current = window.setTimeout(action, delayMs);
  };

  useEffect(() => clear, []);

  return { schedule, clear };
}
