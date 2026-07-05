import type { Mawkib, Reservation } from '../types';
import { formatPersianDate } from '../components/ui/PersianDateInput';
import { MAWKIB_AMENITY_FIELDS, MAWKIB_NOTIFY_FIELDS } from '../components/mawkibs/MawkibExtraFields';
import { mawkibCityLabel, mawkibCountryLabel } from './mawkib-locations';

export interface MawkibCardSocialLink {
  label: string;
  value: string;
}

export interface MawkibCardData {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  ownerFullName: string;
  ownerMobile: string;
  imageUrl?: string | null;
  maleCapacity?: number;
  femaleCapacity?: number;
  countryLabel?: string;
  cityLabel?: string;
  amenities: string[];
  socialLinks: MawkibCardSocialLink[];
  serviceStartDate?: string;
  serviceEndDate?: string;
}

type MawkibCardSource = Pick<
  Mawkib,
  | 'id'
  | 'name'
  | 'address'
  | 'phoneNumber'
  | 'owner'
  | 'imageUrl'
  | 'maleCapacity'
  | 'femaleCapacity'
  | 'country'
  | 'mawkibCity'
  | 'breakfastReception'
  | 'lunchReception'
  | 'dinnerReception'
  | 'bathroom'
  | 'laundry'
  | 'parking'
  | 'internet'
  | 'familyFriendly'
  | 'elevator'
  | 'stairs'
  | 'telegramChannel'
  | 'whatsapp'
  | 'bale'
  | 'eitaa'
  | 'websiteUrl'
  | 'serviceStartDate'
  | 'serviceEndDate'
>;

function formatServiceDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  return formatPersianDate(value.slice(0, 10));
}

function activeAmenityLabels(mawkib: MawkibCardSource): string[] {
  return MAWKIB_AMENITY_FIELDS.filter(({ key }) => Boolean(mawkib[key])).map(
    ({ label }) => label,
  );
}

function activeSocialLinks(mawkib: MawkibCardSource): MawkibCardSocialLink[] {
  return MAWKIB_NOTIFY_FIELDS.flatMap(({ key, label }) => {
    const value = mawkib[key]?.trim();
    return value ? [{ label, value }] : [];
  });
}

function locationLine(countryLabel?: string, cityLabel?: string): string | null {
  const parts = [countryLabel, cityLabel].filter((part) => part && part !== '—');
  return parts.length > 0 ? parts.join(' · ') : null;
}

function buildMawkibCardData(mawkib: MawkibCardSource): MawkibCardData {
  const country = mawkibCountryLabel(mawkib.country);
  const city = mawkibCityLabel(mawkib.mawkibCity);

  return {
    id: mawkib.id,
    name: mawkib.name,
    address: mawkib.address?.trim() || '—',
    phoneNumber: mawkib.phoneNumber?.trim() || '—',
    ownerFullName: mawkib.owner?.fullName?.trim() || '—',
    ownerMobile: mawkib.owner?.mobileNumber?.trim() || '—',
    imageUrl: mawkib.imageUrl,
    maleCapacity: mawkib.maleCapacity,
    femaleCapacity: mawkib.femaleCapacity,
    countryLabel: country !== '—' ? country : undefined,
    cityLabel: city !== '—' ? city : undefined,
    amenities: activeAmenityLabels(mawkib),
    socialLinks: activeSocialLinks(mawkib),
    serviceStartDate: formatServiceDate(mawkib.serviceStartDate),
    serviceEndDate: formatServiceDate(mawkib.serviceEndDate),
  };
}

export function mawkibToCardData(mawkib: MawkibCardSource): MawkibCardData {
  return buildMawkibCardData(mawkib);
}

export function reservationMawkibToCardData(
  mawkib: Reservation['mawkib'],
): MawkibCardData {
  return buildMawkibCardData(mawkib as MawkibCardSource);
}

export function mawkibCardLocationLine(data: MawkibCardData): string | null {
  return locationLine(data.countryLabel, data.cityLabel);
}
