import { useEffect, useMemo, useState } from 'react';
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
}

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    const timer = window.setTimeout(invalidate, 100);
    window.addEventListener('resize', invalidate);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener('resize', invalidate);
    };
  }, [map]);

  return null;
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
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom>
        <MawkibMapInner
          mawkibs={mawkibs}
          country={country}
          mawkibCity={mawkibCity}
          detailPath={detailPath}
        />
      </MapContainer>

      {withoutCoords > 0 && (
        <p className="absolute bottom-3 left-3 right-3 z-[1000] rounded-lg bg-white/90 px-3 py-1.5 text-center text-xs text-slate-600 shadow-sm backdrop-blur-sm">
          {withoutCoords} موکب بدون مختصات جغرافیایی روی نقشه نمایش داده نمی‌شود.
        </p>
      )}
    </div>
  );
}
