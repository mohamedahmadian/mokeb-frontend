export type RoleName = 'Admin' | 'Pilgrim' | 'MawkibOwner';

export interface User {
  id: number;
  fullName: string;
  mobileNumber: string;
  roles: RoleName[];
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export type MawkibStatus = 'Pending' | 'Approved' | 'Rejected';

import type { MawkibCity, MawkibCountry } from '../lib/mawkib-locations';

export interface MawkibExtraFields {
  distanceToShrine?: string | null;
  lunchReception?: boolean;
  breakfastReception?: boolean;
  dinnerReception?: boolean;
  bathroom?: boolean;
  laundry?: boolean;
  parking?: boolean;
  internet?: boolean;
  familyFriendly?: boolean;
  maxReservationDays?: number | null;
  country?: MawkibCountry;
  mawkibCity?: MawkibCity | null;
  rules?: string | null;
  telegramChannel?: string | null;
  whatsapp?: string | null;
  bale?: string | null;
  eitaa?: string | null;
  websiteUrl?: string | null;
}

export interface Mawkib extends MawkibExtraFields {
  id: number;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  phoneNumber: string;
  description?: string | null;
  facilities?: string | null;
  services?: string | null;
  serviceStartDate?: string | null;
  serviceEndDate?: string | null;
  maleCapacity: number;
  femaleCapacity: number;
  availableMaleCapacity?: number;
  availableFemaleCapacity?: number;
  capacity?: number;
  imageUrl?: string | null;
  status: MawkibStatus;
  ownerUserId?: number;
  availableCapacity?: number;
  owner?: {
    id: number;
    fullName: string;
    mobileNumber?: string;
    province?: string | null;
    city?: string | null;
  };
  _count?: { reservations: number };
}

export interface Reservation {
  id: number;
  trackingCode: string;
  maleGuestCount: number;
  femaleGuestCount: number;
  guestCount?: number;
  pilgrimMobile: string;
  reservationDate: string;
  reservationEndDate?: string;
  description?: string | null;
  companions?: string | null;
  cancellationNote?: string | null;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  createdAt?: string;
  mawkib: { id: number; name: string; address?: string };
  pilgrim: { id: number; fullName: string; mobileNumber: string };
  reservedBy: { id: number; fullName: string; mobileNumber?: string };
}

export interface RegistrationRequest {
  id: number;
  ownerName: string;
  phoneNumber: string;
  mawkibName: string;
  address: string;
  capacity: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  owner?: { id: number; fullName: string; mobileNumber: string };
}

export interface UserSocialFields {
  whatsapp?: string;
  telegram?: string;
  bale?: string;
  eitaa?: string;
  email?: string;
}

export interface AdminUser extends UserSocialFields {
  id: number;
  fullName: string;
  mobileNumber: string;
  province?: string;
  city?: string;
  description?: string;
  isActive: boolean;
  roles: { role: { name: RoleName } }[];
  ownedMawkibs?: { id: number; name: string; status: MawkibStatus }[];
}
