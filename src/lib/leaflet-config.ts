import L from 'leaflet';

export const LEAFLET_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

export const LEAFLET_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const mawkibMarkerIcon = L.divIcon({
  className: 'mawkib-leaflet-marker',
  html: `<div class="mawkib-leaflet-marker-dot" aria-hidden="true"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});
