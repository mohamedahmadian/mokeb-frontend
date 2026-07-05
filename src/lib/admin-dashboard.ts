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

export async function lookupAdminReservation(query: string): Promise<{
  reservation: Reservation | null;
  alternatives: Reservation[];
}> {
  return lookupReservationList(query, (filters) =>
    reservationsApi.getAdminList(filters),
  );
}

export async function fetchPendingMawkibs(limit = 5): Promise<Mawkib[]> {
  const list = await mawkibsApi.getAdminList({ status: 'Pending' });
  return list.slice(0, limit);
}
