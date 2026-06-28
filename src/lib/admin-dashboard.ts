import { mawkibsApi } from './mawkibs';
import { reservationsApi } from './reservations';
import {
  computeReservationStats,
  getPendingReservations,
  isMobileLookupQuery,
  normalizeLookupQuery,
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
  const trimmed = normalizeLookupQuery(query);
  if (!trimmed) {
    return { reservation: null, alternatives: [] };
  }

  if (isMobileLookupQuery(trimmed)) {
    const results = await reservationsApi.getAdminList({ pilgrimMobile: trimmed });
    if (results.length === 0) {
      return { reservation: null, alternatives: [] };
    }
    const [first, ...rest] = results;
    return { reservation: first, alternatives: rest };
  }

  const results = await reservationsApi.getAdminList({ trackingCode: trimmed });
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

export async function fetchPendingMawkibs(limit = 5): Promise<Mawkib[]> {
  const list = await mawkibsApi.getAdminList({ status: 'Pending' });
  return list.slice(0, limit);
}
