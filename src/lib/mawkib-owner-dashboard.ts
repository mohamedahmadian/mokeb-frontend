import { reservationsApi } from './reservations';
import type { Reservation } from '../types';
import type { AdminUser } from '../types';

export function normalizeLookupQuery(value: string): string {
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  return value
    .trim()
    .replace(/[۰-۹٠-٩]/g, (ch) => {
      const persianIndex = persian.indexOf(ch);
      if (persianIndex >= 0) return String(persianIndex);
      const arabicIndex = arabic.indexOf(ch);
      return arabicIndex >= 0 ? String(arabicIndex) : ch;
    });
}

export function isMobileLookupQuery(value: string): boolean {
  const trimmed = normalizeLookupQuery(value);
  return trimmed.startsWith('0') || /^9\d{9}$/.test(trimmed);
}

export function isNationalIdLookupQuery(value: string): boolean {
  const trimmed = normalizeLookupQuery(value);
  if (!/^\d{10}$/.test(trimmed)) return false;
  return !/^9\d{9}$/.test(trimmed);
}

export function normalizeMobileLookupQuery(value: string): string {
  const trimmed = normalizeLookupQuery(value);
  if (/^9\d{9}$/.test(trimmed)) return `0${trimmed}`;
  return trimmed;
}

export async function lookupReservationList(
  query: string,
  fetchList: (filters: import('./reservations').ReservationFilters) => Promise<Reservation[]>,
): Promise<{
  reservation: Reservation | null;
  alternatives: Reservation[];
}> {
  const trimmed = normalizeLookupQuery(query);
  if (!trimmed) {
    return { reservation: null, alternatives: [] };
  }

  if (isMobileLookupQuery(trimmed)) {
    const results = await fetchList({
      pilgrimMobile: normalizeMobileLookupQuery(trimmed),
    });
    if (results.length === 0) {
      return { reservation: null, alternatives: [] };
    }
    const [first, ...rest] = results;
    return { reservation: first, alternatives: rest };
  }

  if (isNationalIdLookupQuery(trimmed)) {
    const results = await fetchList({ pilgrimNationalId: trimmed });
    if (results.length === 0) {
      return { reservation: null, alternatives: [] };
    }
    const [first, ...rest] = results;
    return { reservation: first, alternatives: rest };
  }

  const results = await fetchList({ trackingCode: trimmed });
  const exact =
    results.find(
      (item) => item.trackingCode.toLowerCase() === trimmed.toLowerCase(),
    ) ?? results[0] ?? null;

  if (!exact) {
    return { reservation: null, alternatives: [] };
  }

  return {
    reservation: exact,
    alternatives: results.filter((item) => item.id !== exact.id),
  };
}

export async function lookupOwnerReservation(query: string): Promise<{
  reservation: Reservation | null;
  alternatives: Reservation[];
}> {
  return lookupReservationList(query, (filters) =>
    reservationsApi.getMyList(filters),
  );
}

export interface MawkibOwnerReservationStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  completedReservations: number;
}

function sortByNewest<T extends { createdAt?: string; reservationDate?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt ?? a.reservationDate ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? b.reservationDate ?? 0).getTime();
    return bTime - aTime;
  });
}

export function getPendingReservations(
  reservations: Reservation[],
  limit = 5,
): Reservation[] {
  const pending = sortByNewest(reservations.filter((r) => r.status === 'Pending'));
  const selected = pending.slice(0, limit);
  return selected.sort((a, b) => {
    const aTime = new Date(a.createdAt ?? 0).getTime();
    const bTime = new Date(b.createdAt ?? 0).getTime();
    return aTime - bTime;
  });
}

export function getRecentReservationsForOwner(
  reservations: Reservation[],
  limit = 5,
): Reservation[] {
  return sortByNewest(reservations).slice(0, limit);
}

export function computeReservationStats(
  reservations: Reservation[],
): MawkibOwnerReservationStats {
  return {
    totalReservations: reservations.length,
    pendingReservations: reservations.filter((r) => r.status === 'Pending').length,
    confirmedReservations: reservations.filter((r) => r.status === 'Confirmed').length,
    cancelledReservations: reservations.filter((r) => r.status === 'Cancelled').length,
    completedReservations: reservations.filter((r) => r.status === 'Completed').length,
  };
}

export function getRecentPilgrims(pilgrims: AdminUser[], limit = 10): AdminUser[] {
  return pilgrims.slice(0, limit);
}
