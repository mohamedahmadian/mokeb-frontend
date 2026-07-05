import {
  AFGHANISTAN_PROVINCES,
  IRAQ_PROVINCES,
  PAKISTAN_PROVINCES,
  TURKEY_PROVINCES,
} from './country-provinces-data';
import {
  getCitiesByProvinceFromLocations,
  getProvincesFromLocations,
  type IranLocation,
} from './iran-locations';
import {
  DEFAULT_USER_COUNTRY,
  isSupportedCountry,
  normalizeCountryName,
} from './countries';

function sortFa(items: string[]): string[] {
  return [...items].sort((a, b) => a.localeCompare(b, 'fa'));
}

function withCustomValue(value: string, options: readonly string[] | string[]): string[] {
  const trimmed = value.trim();
  if (trimmed && !options.includes(trimmed)) {
    return [trimmed, ...options];
  }
  return [...options];
}

export function getProvincesForCountry(
  country: string,
  iranLocations: IranLocation[],
): string[] {
  const normalized = normalizeCountryName(country) || DEFAULT_USER_COUNTRY;

  if (normalized === 'ایران') {
    return getProvincesFromLocations(iranLocations);
  }
  if (normalized === 'افغانستان') {
    return sortFa([...AFGHANISTAN_PROVINCES]);
  }
  if (normalized === 'عراق') {
    return sortFa([...IRAQ_PROVINCES]);
  }
  if (normalized === 'ترکیه') {
    return sortFa([...TURKEY_PROVINCES]);
  }
  if (normalized === 'پاکستان') {
    return sortFa([...PAKISTAN_PROVINCES]);
  }

  return [];
}

export function getProvinceOptionsForCountry(
  country: string,
  province: string,
  iranLocations: IranLocation[],
): string[] {
  return withCustomValue(province, getProvincesForCountry(country, iranLocations));
}

export function getCitiesForCountryProvince(
  country: string,
  province: string,
  iranLocations: IranLocation[],
): string[] {
  const normalizedCountry = normalizeCountryName(country) || DEFAULT_USER_COUNTRY;
  const normalizedProvince = province.trim();

  if (normalizedCountry === 'ایران' && normalizedProvince) {
    return getCitiesByProvinceFromLocations(iranLocations, normalizedProvince);
  }

  return [];
}

export function getCityOptionsForCountryProvince(
  country: string,
  province: string,
  city: string,
  iranLocations: IranLocation[],
): string[] {
  return withCustomValue(
    city,
    getCitiesForCountryProvince(country, province, iranLocations),
  );
}

export function countryHasProvinceList(country: string): boolean {
  return isSupportedCountry(normalizeCountryName(country) || DEFAULT_USER_COUNTRY);
}

export function countryHasCityList(country: string): boolean {
  return normalizeCountryName(country) === 'ایران';
}
