import locations from './iran-locations.json';

export interface IranLocation {
  province: string;
  cities: string[];
}

export const IRAN_LOCATIONS = locations as IranLocation[];

export const IRAN_PROVINCES = [...IRAN_LOCATIONS.map((p) => p.province)].sort((a, b) =>
  a.localeCompare(b, 'fa'),
);

export function getCitiesByProvince(province: string): string[] {
  const found = IRAN_LOCATIONS.find((p) => p.province === province);
  if (!found) return [];
  return [...found.cities].sort((a, b) => a.localeCompare(b, 'fa'));
}
