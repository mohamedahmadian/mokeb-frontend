import type { Reservation } from '../types';

export function getReservationStatusActionLabel(
  reservation: Pick<Reservation, 'status' | 'cancellationNote'>,
): string | null {
  if (reservation.status === 'Confirmed') return 'تایید شده توسط';
  if (reservation.status === 'Cancelled') {
    return reservation.cancellationNote ? 'رد شده توسط' : 'لغو شده توسط';
  }
  return null;
}

export function formatReservationStatusUpdatedBy(
  reservation: Pick<
    Reservation,
    'status' | 'cancellationNote' | 'lastStatusUpdatedBy' | 'lastStatusUpdatedAt'
  >,
): string | null {
  if (!reservation.lastStatusUpdatedBy) return null;
  const actionLabel = getReservationStatusActionLabel(reservation);
  if (!actionLabel) return reservation.lastStatusUpdatedBy.fullName;
  return `${actionLabel} ${reservation.lastStatusUpdatedBy.fullName}`;
}
