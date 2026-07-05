/** پیش‌فرض کشور کاربر (زائر) */
export const DEFAULT_USER_COUNTRY = 'ایران' as const;

/** کشورهایی که لیست استان دارند */
export const SUPPORTED_COUNTRIES = [
  'ایران',
  'افغانستان',
  'عراق',
  'ترکیه',
  'پاکستان',
] as const;

export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];

/** پیشنهادها در CountrySelect؛ کاربر می‌تواند کشور دیگری هم تایپ کند */
export const COUNTRY_OPTIONS: readonly string[] = [...SUPPORTED_COUNTRIES];

export function normalizeCountryName(country: string): string {
  return country.trim();
}

export function isSupportedCountry(country: string): country is SupportedCountry {
  const normalized = normalizeCountryName(country);
  return (SUPPORTED_COUNTRIES as readonly string[]).includes(normalized);
}
