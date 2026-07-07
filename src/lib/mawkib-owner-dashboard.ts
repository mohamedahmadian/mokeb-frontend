import { reservationsApi } from './reservations';
import type { Reservation } from '../types';
import type { AdminUser } from '../types';
import type { ReservationStatus } from './reservations';
import { rankReservationsByLookupQuery } from './reservation-lookup';

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

export async function lookupReservationList(
  query: string,
  fetchList: (filters: import('./reservations').ReservationFilters) => Promise<Reservation[]>,
  options?: {
    single?: boolean;
    exact?: boolean;
    status?: ReservationStatus;
  },
): Promise<{
  reservation: Reservation | null;
  alternatives: Reservation[];
}> {
  const trimmed = normalizeLookupQuery(query);
  if (!trimmed) {
    return { reservation: null, alternatives: [] };
  }

  const results = await fetchList({
    lookupQuery: trimmed,
    lookupExact: options?.exact ?? false,
    all: true,
    ...(options?.status ? { status: options.status } : {}),
    ...(options?.single ? { lookupSingle: true } : {}),
  });

  if (results.length === 0) {
    return { reservation: null, alternatives: [] };
  }

  const ranked = rankReservationsByLookupQuery(
    results,
    trimmed,
    options?.exact ?? false,
  );

  if (options?.single) {
    return { reservation: ranked[0] ?? null, alternatives: [] };
  }

  const [first, ...rest] = ranked;
  return { reservation: first, alternatives: rest };
}

export async function lookupOwnerReservation(
  query: string,
  options?: {
    single?: boolean;
    exact?: boolean;
    status?: ReservationStatus;
  },
): Promise<{
  reservation: Reservation | null;
  alternatives: Reservation[];
}> {
  return lookupReservationList(
    query,
    (filters) => reservationsApi.getMyList(filters),
    options,
  );
}

export async function lookupOwnerReservationSingle(
  query: string,
): Promise<Reservation | null> {
  const result = await lookupOwnerReservation(query, { single: true });
  return result.reservation;
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
