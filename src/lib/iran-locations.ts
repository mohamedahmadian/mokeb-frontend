import locations from './iran-locations.json';

export interface IranLocation {
  province: string;
  cities: string[];
}

export const FALLBACK_IRAN_LOCATIONS = locations as IranLocation[];

export function getProvincesFromLocations(locations: IranLocation[]): string[] {
  return [...locations.map((item) => item.province)].sort((a, b) =>
    a.localeCompare(b, 'fa'),
  );
}

export function getCitiesByProvinceFromLocations(
  locations: IranLocation[],
  province: string,
): string[] {
  const found = locations.find((item) => item.province === province);
  if (!found) return [];
  return [...found.cities].sort((a, b) => a.localeCompare(b, 'fa'));
}

/** @deprecated Use useIranLocations() for runtime data */
export const IRAN_LOCATIONS = FALLBACK_IRAN_LOCATIONS;

/** @deprecated Use useIranLocations() for runtime data */
export const IRAN_PROVINCES = getProvincesFromLocations(FALLBACK_IRAN_LOCATIONS);

/** @deprecated Use useIranLocations() for runtime data */
export function getCitiesByProvince(province: string): string[] {
  return getCitiesByProvinceFromLocations(FALLBACK_IRAN_LOCATIONS, province);
}
