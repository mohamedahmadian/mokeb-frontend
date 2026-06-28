import type { MawkibCity, MawkibCountry } from './mawkib-locations';

export interface LatLng {
  lat: number;
  lng: number;
}

export const CITY_CENTERS: Record<MawkibCity, LatLng> = {
  Mashhad: { lat: 36.297, lng: 59.606 },
  Qom: { lat: 34.641, lng: 50.874 },
  Najaf: { lat: 32.0, lng: 44.333 },
  Karbala: { lat: 32.614, lng: 44.024 },
};

export const COUNTRY_CENTERS: Record<MawkibCountry, LatLng> = {
  Iran: { lat: 32.5, lng: 53.5 },
  Iraq: { lat: 33.0, lng: 44.0 },
};

export const DEFAULT_MAP_CENTER: LatLng = { lat: 32.5, lng: 50.0 };
export const DEFAULT_MAP_ZOOM = 6;

export function getMapCenter(options: {
  mawkibCity?: MawkibCity | '';
  country?: MawkibCountry | '';
}): LatLng {
  if (options.mawkibCity) return CITY_CENTERS[options.mawkibCity];
  if (options.country) return COUNTRY_CENTERS[options.country];
  return DEFAULT_MAP_CENTER;
}

export function getMapZoom(options: {
  mawkibCity?: MawkibCity | '';
  country?: MawkibCountry | '';
}): number {
  if (options.mawkibCity) return 12;
  if (options.country) return 7;
  return DEFAULT_MAP_ZOOM;
}

export function hasValidCoords(
  latitude?: number | null,
  longitude?: number | null,
): latitude is number {
  return (
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export interface LatLngBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export function computeBounds(points: LatLng[]): LatLngBounds | null {
  if (points.length === 0) return null;
  if (points.length === 1) {
    const p = points[0];
    const delta = 0.02;
    return {
      north: p.lat + delta,
      south: p.lat - delta,
      east: p.lng + delta,
      west: p.lng - delta,
    };
  }

  let north = points[0].lat;
  let south = points[0].lat;
  let east = points[0].lng;
  let west = points[0].lng;

  for (const p of points) {
    north = Math.max(north, p.lat);
    south = Math.min(south, p.lat);
    east = Math.max(east, p.lng);
    west = Math.min(west, p.lng);
  }

  return { north, south, east, west };
}
