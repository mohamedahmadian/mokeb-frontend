export interface ReservationConflictInfo {
  trackingCode: string;
  mawkibName: string | null;
  reservationDate: string;
  reservationEndDate: string;
}

function isConflictPayload(value: unknown): value is ReservationConflictInfo {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.trackingCode === 'string' &&
    typeof record.reservationDate === 'string' &&
    typeof record.reservationEndDate === 'string' &&
    (record.mawkibName === null || typeof record.mawkibName === 'string')
  );
}

export function parseReservationConflictError(
  err: unknown,
): ReservationConflictInfo | null {
  if (
    !err ||
    typeof err !== 'object' ||
    !('response' in err) ||
    !err.response ||
    typeof err.response !== 'object' ||
    !('data' in err.response)
  ) {
    return null;
  }

  const data = err.response.data;
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  if (record.error !== 'ReservationConflict') return null;
  if (!isConflictPayload(record.conflict)) return null;

  return record.conflict;
}

export function isReservationConflictMessage(message: string): boolean {
  return (
    message.includes('تداخل') ||
    message.includes('رزرو فعال دیگری')
  );
}
