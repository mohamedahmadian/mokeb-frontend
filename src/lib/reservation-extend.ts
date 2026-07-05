import {
  addGregorianDays,
  defaultReservationEndDate,
  effectiveDefaultReservationDays,
  effectiveMaxReservationDays,
  reservationStayDayCount,
} from './date-range';
import type { Reservation } from '../types';

export function canExtendReservation(reservation: Reservation): boolean {
  return reservation.status === 'Confirmed' || reservation.status === 'Completed';
}

export function computeExtensionStartDate(source: Reservation): string {
  return (source.reservationEndDate ?? source.reservationDate).slice(0, 10);
}

export function computeExtensionEndDateForStayDays(
  extensionStart: string,
  stayDays: number,
): string {
  return addGregorianDays(extensionStart, stayDays);
}

export function defaultExtensionStayDays(source: Reservation): number {
  return effectiveDefaultReservationDays(source.mawkib.defaultReservationDays);
}

export function defaultExtensionEndDate(source: Reservation): string {
  const start = computeExtensionStartDate(source);
  return defaultReservationEndDate(start, source.mawkib.defaultReservationDays);
}

export function isExtensionStayDaysAllowed(
  source: Reservation,
  stayDays: number,
): boolean {
  const start = computeExtensionStartDate(source);
  const end = computeExtensionEndDateForStayDays(start, stayDays);
  const maxDays = effectiveMaxReservationDays(source.mawkib.maxReservationDays);
  return reservationStayDayCount(start, end) <= maxDays;
}

export const EXTENSION_DAY_OPTIONS = [1, 2, 3] as const;

export function extensionSuccessMessage(
  status: Reservation['status'],
): string {
  return status === 'Confirmed'
    ? 'تمدید رزرو با موفقیت ثبت و تایید شد'
    : 'درخواست تمدید ثبت شد و در انتظار تایید موکب‌دار قرار گرفت';
}
