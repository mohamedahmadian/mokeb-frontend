import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import {
  getMapCenter,
  getMapZoom,
  hasValidCoords,
  type LatLng,
} from '../../lib/geo';
import type { MawkibCity, MawkibCountry } from '../../lib/mawkib-locations';
import type { Mawkib } from '../../types';
import {
  MawkibMapHoverOverlay,
  useHoverDelay,
} from './MawkibMapHoverCard';

import {
  LEAFLET_TILE_ATTRIBUTION,
  LEAFLET_TILE_URL,
  mawkibMarkerIcon,
} from '../../lib/leaflet-config';

import 'leaflet/dist/leaflet.css';

interface MawkibMapProps {
  mawkibs: Mawkib[];
  country?: MawkibCountry | '';
  mawkibCity?: MawkibCity | '';
  detailPath?: (id: number) => string;
  /** Remount map when container becomes visible or layout changes */
  mountKey?: string | number;
}

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    const timer = window.setTimeout(invalidate, 150);
    const timer2 = window.setTimeout(invalidate, 400);
    window.addEventListener('resize', invalidate);

    const container = map.getContainer();
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(invalidate)
        : null;
    observer?.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.clearTimeout(timer2);
      window.removeEventListener('resize', invalidate);
      observer?.disconnect();
    };
  }, [map]);

  return null;
}

function MapReadyGate({
  mountKey,
  children,
}: {
  mountKey: string | number;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    const el = containerRef.current;
    if (!el) return;

    const tryActivate = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setReady(true);
        return true;
      }
      return false;
    };

    if (tryActivate()) return;

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            if (tryActivate()) observer?.disconnect();
          })
        : null;
    observer?.observe(el);

    const raf = requestAnimationFrame(() => tryActivate());
    const timer = window.setTimeout(() => tryActivate(), 200);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      observer?.disconnect();
    };
  }, [mountKey]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {ready ? (
        children
      ) : (
        <div className="flex h-full min-h-[24rem] items-center justify-center bg-slate-200 sm:min-h-[28rem]">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-300 border-t-[#4a6fa5]" />
        </div>
      )}
    </div>
  );
}

function MapViewController({
  points,
  center,
  zoom,
}: {
  points: LatLng[];
  center: LatLng;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 14);
      return;
    }
    if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [48, 48] });
      return;
    }
    map.setView([center.lat, center.lng], zoom);
  }, [map, points, center, zoom]);

  return null;
}

function MawkibMarker({
  mawkib,
  isHovered,
  onHoverStart,
  onHoverEnd,
}: {
  mawkib: Mawkib;
  isHovered: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const position: [number, number] = [mawkib.latitude!, mawkib.longitude!];

  return (
    <Marker
      position={position}
      icon={mawkibMarkerIcon}
      zIndexOffset={isHovered ? 1000 : 0}
      eventHandlers={{
        mouseover: onHoverStart,
        mouseout: onHoverEnd,
      }}
    />
  );
}

function MawkibMapInner({
  mawkibs,
  country,
  mawkibCity,
  detailPath,
}: MawkibMapProps) {
  const [hoveredMawkib, setHoveredMawkib] = useState<Mawkib | null>(null);
  const hoverDelay = useHoverDelay(100);

  const mawkibsWithCoords = useMemo(
    () => mawkibs.filter((m) => hasValidCoords(m.latitude, m.longitude)),
    [mawkibs],
  );

  const points = useMemo(
    () =>
      mawkibsWithCoords.map((m) => ({
        lat: m.latitude!,
        lng: m.longitude!,
      })),
    [mawkibsWithCoords],
  );

  const center = useMemo(
    () => getMapCenter({ mawkibCity, country }),
    [country, mawkibCity],
  );

  const zoom = useMemo(
    () => getMapZoom({ mawkibCity, country }),
    [country, mawkibCity],
  );

  const resolveDetailPath = detailPath ?? ((id: number) => `/mawkibs/${id}/view`);

  const handleHoverStart = (mawkib: Mawkib) => {
    hoverDelay.clear();
    setHoveredMawkib(mawkib);
  };

  const handleHoverEnd = () => {
    hoverDelay.schedule(() => setHoveredMawkib(null));
  };

  const handleCardHoverStart = () => {
    hoverDelay.clear();
  };

  return (
    <>
      <TileLayer attribution={LEAFLET_TILE_ATTRIBUTION} url={LEAFLET_TILE_URL} />
      <MapResizeFix />
      <MapViewController points={points} center={center} zoom={zoom} />
      {mawkibsWithCoords.map((mawkib) => (
        <MawkibMarker
          key={mawkib.id}
          mawkib={mawkib}
          isHovered={hoveredMawkib?.id === mawkib.id}
          onHoverStart={() => handleHoverStart(mawkib)}
          onHoverEnd={handleHoverEnd}
        />
      ))}
      {hoveredMawkib &&
        hasValidCoords(hoveredMawkib.latitude, hoveredMawkib.longitude) && (
          <MawkibMapHoverOverlay
            mawkib={hoveredMawkib}
            position={[hoveredMawkib.latitude!, hoveredMawkib.longitude!]}
            detailPath={resolveDetailPath}
            onMouseEnter={handleCardHoverStart}
            onMouseLeave={handleHoverEnd}
          />
        )}
    </>
  );
}

export function MawkibMap({
  mawkibs,
  country,
  mawkibCity,
  detailPath,
  mountKey = 'default',
}: MawkibMapProps) {
  const mawkibsWithCoords = useMemo(
    () => mawkibs.filter((m) => hasValidCoords(m.latitude, m.longitude)),
    [mawkibs],
  );

  const center = useMemo(
    () => getMapCenter({ mawkibCity, country }),
    [country, mawkibCity],
  );

  const zoom = useMemo(
    () => getMapZoom({ mawkibCity, country }),
    [country, mawkibCity],
  );

  const withoutCoords = mawkibs.length - mawkibsWithCoords.length;

  return (
    <div className="mawkib-map-root">
      <MapReadyGate mountKey={mountKey}>
        <MapContainer
          key={String(mountKey)}
          center={[center.lat, center.lng]}
          zoom={zoom}
          scrollWheelZoom
          className="h-full w-full"
        >
          <MawkibMapInner
            mawkibs={mawkibs}
            country={country}
            mawkibCity={mawkibCity}
            detailPath={detailPath}
          />
        </MapContainer>
      </MapReadyGate>

      {withoutCoords > 0 && (
        <p className="absolute bottom-3 left-3 right-3 z-[1000] rounded-lg bg-white/90 px-3 py-1.5 text-center text-xs text-slate-600 shadow-sm backdrop-blur-sm">
          {withoutCoords} موکب بدون مختصات جغرافیایی روی نقشه نمایش داده نمی‌شود.
        </p>
      )}
    </div>
  );
}
