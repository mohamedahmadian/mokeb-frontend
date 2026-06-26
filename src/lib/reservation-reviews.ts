import type { Reservation } from '../types';

export function canPilgrimReviewReservation(
  reservation: Reservation,
  userId?: number,
): boolean {
  if (!userId) return false;
  if (reservation.pilgrim.id !== userId) return false;
  return reservation.status === 'Confirmed' || reservation.status === 'Completed';
}

export function canEditReservationReview(
  reservation: Reservation,
  userId?: number,
): boolean {
  return canPilgrimManageReview(reservation, userId) && !!reservation.review;
}

/** زائر می‌تواند نظر ثبت یا ویرایش کند تا قبل از دریافت پاسخ مدیریت/موکب */
export function canPilgrimManageReview(
  reservation: Reservation,
  userId?: number,
): boolean {
  if (!canPilgrimReviewReservation(reservation, userId)) return false;
  return !reservation.review?.adminReply;
}

export function canManageReservationReviewReply(
  roles: string[] | undefined,
  reservation: Reservation,
): boolean {
  if (!reservation.review) return false;
  const isAdmin = roles?.includes('Admin') ?? false;
  const isMawkibOwner = roles?.includes('MawkibOwner') ?? false;
  return isAdmin || isMawkibOwner;
}

export function reservationReviewReplyLabel(roles: string[] | undefined): string {
  const isAdmin = roles?.includes('Admin') ?? false;
  const isMawkibOwner = roles?.includes('MawkibOwner') ?? false;
  if (isMawkibOwner && !isAdmin) return 'پاسخ موکب';
  return 'پاسخ مدیریت';
}
