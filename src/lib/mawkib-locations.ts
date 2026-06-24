export type MawkibCountry = 'Iran' | 'Iraq';
export type MawkibCity = 'Mashhad' | 'Qom' | 'Najaf' | 'Karbala';

export const MAWKIB_COUNTRIES: { value: MawkibCountry; label: string }[] = [
  { value: 'Iran', label: 'ایران' },
  { value: 'Iraq', label: 'عراق' },
];

export const MAWKIB_CITIES: { value: MawkibCity; label: string }[] = [
  { value: 'Mashhad', label: 'مشهد' },
  { value: 'Qom', label: 'قم' },
  { value: 'Najaf', label: 'نجف' },
  { value: 'Karbala', label: 'کربلا' },
];

export function mawkibCountryLabel(value?: MawkibCountry | null) {
  return MAWKIB_COUNTRIES.find((c) => c.value === value)?.label ?? '—';
}

export function mawkibCityLabel(value?: MawkibCity | null) {
  return MAWKIB_CITIES.find((c) => c.value === value)?.label ?? '—';
}
