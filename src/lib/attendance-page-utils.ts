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
