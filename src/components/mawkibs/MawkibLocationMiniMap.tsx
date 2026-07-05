import { useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { hasValidCoords } from '../../lib/geo';
import {
  LEAFLET_TILE_ATTRIBUTION,
  LEAFLET_TILE_URL,
  mawkibMarkerIcon,
} from '../../lib/leaflet-config';
import { MapReadyGate, MapResizeFix } from './leaflet-map-host';

import 'leaflet/dist/leaflet.css';

interface MawkibLocationMiniMapProps {
  latitude?: number | null;
  longitude?: number | null;
  zoom?: number;
  className?: string;
  /** Remount map when container becomes visible (e.g. modal open) */
  mountKey?: string | number | boolean;
  editable?: boolean;
  onPositionChange?: (latitude: number, longitude: number) => void;
}

function MapInitialCenter({
  latitude,
  longitude,
  zoom,
  mountKey,
}: {
  latitude: number;
  longitude: number;
  zoom: number;
  mountKey: string | number | boolean;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], zoom);
    const timer = window.setTimeout(() => map.invalidateSize(), 100);
    return () => window.clearTimeout(timer);
  }, [map, latitude, longitude, zoom, mountKey]);

  return null;
}

function MapPickHandler({
  onPick,
}: {
  onPick: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function DraggableMarker({
  position,
  onMove,
}: {
  position: [number, number];
  onMove: (latitude: number, longitude: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    markerRef.current?.setLatLng(position);
  }, [position]);

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={mawkibMarkerIcon}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          onMove(lat, lng);
        },
      }}
    />
  );
}

export function MawkibLocationMiniMap({
  latitude,
  longitude,
  zoom = 15,
  className = '',
  mountKey = 'default',
  editable = false,
  onPositionChange,
}: MawkibLocationMiniMapProps) {
  if (!hasValidCoords(latitude, longitude)) {
    return (
      <div
        className={`flex min-h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-xs text-slate-500 ${className}`}
      >
        موقعیت جغرافیایی ثبت نشده است
      </div>
    );
  }

  const lat = latitude!;
  const lng = longitude!;
  const position: [number, number] = [lat, lng];

  const handleMove = (nextLat: number, nextLng: number) => {
    onPositionChange?.(nextLat, nextLng);
  };

  const isModalMap = className.includes('mawkib-mini-map-modal');

  return (
    <div
      className={`mawkib-mini-map overflow-hidden rounded-xl border border-slate-200 ${className}`}
    >
      <MapReadyGate
        mountKey={mountKey}
        minHeightClass={isModalMap ? 'min-h-[18rem] sm:min-h-[22rem]' : 'min-h-48'}
      >
        <MapContainer
          key={String(mountKey)}
          center={position}
          zoom={zoom}
          scrollWheelZoom={editable}
          dragging
          zoomControl
          className="h-full w-full"
        >
          <TileLayer
            attribution={LEAFLET_TILE_ATTRIBUTION}
            url={LEAFLET_TILE_URL}
          />
          <MapResizeFix />
          <MapInitialCenter
            latitude={lat}
            longitude={lng}
            zoom={zoom}
            mountKey={mountKey}
          />
          {editable ? (
            <>
              <MapPickHandler onPick={handleMove} />
              <DraggableMarker position={position} onMove={handleMove} />
            </>
          ) : (
            <Marker position={position} icon={mawkibMarkerIcon} />
          )}
        </MapContainer>
      </MapReadyGate>
    </div>
  );
}
