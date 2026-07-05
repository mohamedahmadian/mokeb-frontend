import type { Reservation } from '../types';
import {
  DEFAULT_CHECK_IN_TIME,
  normalizeTimeValue,
} from './format-time';

const ACTIVE_STATUSES = new Set<Reservation['status']>(['Pending', 'Confirmed']);

function todayLocalDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function reservationStartDate(reservation: Reservation): string {
  return reservation.reservationDate.slice(0, 10);
}

function reservationEndDate(reservation: Reservation): string {
  return (reservation.reservationEndDate ?? reservation.reservationDate).slice(0, 10);
}

export function reservationIncludesDate(
  reservation: Reservation,
  date = todayLocalDateString(),
): boolean {
  const start = reservationStartDate(reservation);
  const end = reservationEndDate(reservation);
  return start <= date && date <= end;
}

export function isActiveReservation(reservation: Reservation): boolean {
  if (!ACTIVE_STATUSES.has(reservation.status)) return false;
  return reservationEndDate(reservation) >= todayLocalDateString();
}

function compareFeaturedReservations(a: Reservation, b: Reservation): number {
  if (a.status !== b.status) {
    if (a.status === 'Confirmed') return -1;
    if (b.status === 'Confirmed') return 1;
  }

  const startCompare = reservationStartDate(a).localeCompare(
    reservationStartDate(b),
  );
  if (startCompare !== 0) return startCompare;

  return reservationEndDate(a).localeCompare(reservationEndDate(b));
}

/**
 * رزرو برجسته داشبورد زائر:
 * ۱) رزروی که امروز در بازه اقامت آن باشد
 * ۲) در غیر این صورت نزدیک‌ترین رزرو آینده (بر اساس تاریخ شروع)
 */
export function findLatestActiveReservation(
  reservations: Reservation[],
): Reservation | null {
  const today = todayLocalDateString();
  const candidates = reservations.filter((reservation) =>
    ACTIVE_STATUSES.has(reservation.status),
  );
  if (candidates.length === 0) return null;

  const includesToday = candidates.filter((reservation) =>
    reservationIncludesDate(reservation, today),
  );
  if (includesToday.length > 0) {
    return [...includesToday].sort(compareFeaturedReservations)[0];
  }

  const upcoming = candidates
    .filter((reservation) => reservationStartDate(reservation) > today)
    .sort((a, b) => {
      const startDiff = reservationStartDate(a).localeCompare(
        reservationStartDate(b),
      );
      if (startDiff !== 0) return startDiff;
      return compareFeaturedReservations(a, b);
    });

  return upcoming[0] ?? null;
}

export function getReservationCheckInAt(reservation: Reservation): Date {
  const dateStr = reservation.reservationDate.slice(0, 10);
  const time = normalizeTimeValue(
    reservation.plannedCheckInTime
      ?? reservation.mawkib.defaultCheckInTime
      ?? DEFAULT_CHECK_IN_TIME,
  );
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

export function findCountdownReservation(
  reservations: Reservation[],
): Reservation | null {
  const now = Date.now();
  const candidates = reservations
    .filter(
      (r) =>
        r.status === 'Confirmed'
        && !r.actualCheckInAt
        && getReservationCheckInAt(r).getTime() > now,
    )
    .sort(
      (a, b) =>
        getReservationCheckInAt(a).getTime() - getReservationCheckInAt(b).getTime(),
    );

  return candidates[0] ?? null;
}

export interface CountdownParts {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getCountdownParts(target: Date, now = new Date()): CountdownParts {
  const totalMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { totalMs, days, hours, minutes, seconds };
}

export function formatCountdownFa(parts: CountdownParts): string {
  if (parts.totalMs <= 0) return 'زمان ورود رسیده است';

  const segments: string[] = [];
  if (parts.days > 0) {
    segments.push(`${parts.days.toLocaleString('fa-IR')} روز`);
  }
  if (parts.hours > 0 || parts.days > 0) {
    segments.push(`${parts.hours.toLocaleString('fa-IR')} ساعت`);
  }
  if (parts.days === 0 && parts.minutes > 0) {
    segments.push(`${parts.minutes.toLocaleString('fa-IR')} دقیقه`);
  }

  if (segments.length === 0) {
    return 'کمتر از یک دقیقه';
  }

  return segments.slice(0, 2).join(' و ');
}

export function getRecentReservations(
  reservations: Reservation[],
  limit = 3,
): Reservation[] {
  return [...reservations]
    .sort((a, b) => {
      const aTime = new Date(a.createdAt ?? a.reservationDate).getTime();
      const bTime = new Date(b.createdAt ?? b.reservationDate).getTime();
      return bTime - aTime;
    })
    .slice(0, limit);
}
