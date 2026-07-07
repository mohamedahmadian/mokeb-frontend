import { formatPersianDate } from '../components/ui/PersianDateInput';
import { todayLocalGregorianDateString } from './format-time';
import type { AttendanceRosterKind } from './attendance-roster';

export function attendancePagePath(lookupQuery: string): string {
  const trimmed = lookupQuery.trim();
  if (!trimmed) return '/attendance';
  return `/attendance?q=${encodeURIComponent(trimmed)}`;
}

export function attendanceLookupQueryFromReservation(reservation: {
  trackingCode: string;
  pilgrimMobile?: string;
}): string {
  return reservation.trackingCode.trim() || reservation.pilgrimMobile?.trim() || '';
}

export function isAttendanceEligibleReservation(status: string): boolean {
  return status !== 'Pending' && status !== 'Cancelled';
}

export function formatAttendanceRosterTodayLabel(): string {
  return formatPersianDate(todayLocalGregorianDateString());
}

export function attendanceRosterTitle(kind: AttendanceRosterKind): string {
  const base = kind === 'absent' ? 'لیست غائبین' : 'لیست حاضرین';
  return `${base} (${formatAttendanceRosterTodayLabel()})`;
}
