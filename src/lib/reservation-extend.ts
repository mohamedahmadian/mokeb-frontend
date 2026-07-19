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

export function reservationStartDate(source: Reservation): string {
  return source.reservationDate.slice(0, 10);
}

export function currentReservationEndDate(source: Reservation): string {
  return (source.reservationEndDate ?? source.reservationDate).slice(0, 10);
}

export function computeExtendedEndDate(
  currentEndDate: string,
  extraDays: number,
): string {
  return addGregorianDays(currentEndDate, extraDays);
}

export function defaultExtensionStayDays(source: Reservation): number {
  return effectiveDefaultReservationDays(source.mawkib.defaultReservationDays);
}

export function defaultExtendedEndDate(source: Reservation): string {
  const currentEnd = currentReservationEndDate(source);
  return defaultReservationEndDate(
    currentEnd,
    source.mawkib.defaultReservationDays,
  );
}

export function isExtensionStayDaysAllowed(
  source: Reservation,
  extraDays: number,
): boolean {
  const start = reservationStartDate(source);
  const newEnd = computeExtendedEndDate(currentReservationEndDate(source), extraDays);
  const maxDays = effectiveMaxReservationDays(source.mawkib.maxReservationDays);
  return reservationStayDayCount(start, newEnd) <= maxDays;
}

export const EXTENSION_DAY_OPTIONS = [1, 2, 3] as const;

export function extensionSuccessMessage(): string {
  return 'تاریخ پایان رزرو با موفقیت به‌روزرسانی شد';
}

/** @deprecated Use reservationStartDate */
export function computeExtensionStartDate(source: Reservation): string {
  return currentReservationEndDate(source);
}

/** @deprecated Use computeExtendedEndDate */
export function computeExtensionEndDateForStayDays(
  currentEndDate: string,
  extraDays: number,
): string {
  return computeExtendedEndDate(currentEndDate, extraDays);
}

/** @deprecated Use defaultExtendedEndDate */
export function defaultExtensionEndDate(source: Reservation): string {
  return defaultExtendedEndDate(source);
}
