import type { UserGender } from '../types';

export const USER_GENDER_OPTIONS: { value: UserGender; label: string }[] = [
  { value: 'Male', label: 'آقا' },
  { value: 'Female', label: 'بانو' },
];

export function userGenderLabel(gender?: UserGender | null): string {
  if (gender === 'Male') return 'آقا';
  if (gender === 'Female') return 'بانو';
  return '—';
}

export function isUserGender(value: string): value is UserGender {
  return value === 'Male' || value === 'Female';
}

/** Single-guest quick reservation: 1 male → Male, 1 female → Female, else unspecified. */
export function genderFromGuestCounts(
  maleGuestCount: number,
  femaleGuestCount: number,
): UserGender | '' {
  if (maleGuestCount === 1 && femaleGuestCount === 0) return 'Male';
  if (maleGuestCount === 0 && femaleGuestCount === 1) return 'Female';
  return '';
}
