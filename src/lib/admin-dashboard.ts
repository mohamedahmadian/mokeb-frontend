import { mawkibsApi } from './mawkibs';
import { reservationsApi } from './reservations';
import {
  computeReservationStats,
  getPendingReservations,
  lookupReservationList,
} from './mawkib-owner-dashboard';
import type { Mawkib, Reservation } from '../types';

export { computeReservationStats, getPendingReservations };

export function getPendingMawkibs(mawkibs: Mawkib[], limit = 5): Mawkib[] {
  return mawkibs
    .filter((m) => m.status === 'Pending')
    .slice(0, limit);
}

export async function lookupAdminReservation(
  query: string,
  options?: { single?: boolean },
): Promise<{
  reservation: Reservation | null;
  alternatives: Reservation[];
}> {
  return lookupReservationList(
    query,
    (filters) => reservationsApi.getAdminList(filters),
    options,
  );
}

export async function lookupAdminReservationSingle(
  query: string,
): Promise<Reservation | null> {
  const result = await lookupAdminReservation(query, { single: true });
  return result.reservation;
}

export async function fetchPendingMawkibs(limit = 5): Promise<Mawkib[]> {
  const list = await mawkibsApi.getAdminList({ status: 'Pending' });
  return list.slice(0, limit);
}
