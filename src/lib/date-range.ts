export function eachGregorianDay(start: string, end: string): string[] {
  const days: string[] = [];
  const cur = new Date(start + 'T12:00:00');
  const endDate = new Date(end + 'T12:00:00');

  while (cur <= endDate) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }

  return days;
}

export async function getMinCapacityInRange(
  fetchCapacity: (date: string) => Promise<import('./capacity').MawkibCapacitySnapshot>,
  start: string,
  end: string,
): Promise<import('./capacity').MawkibCapacitySnapshot> {
  const days = eachGregorianDay(start, end);
  const snapshots = await Promise.all(days.map((day) => fetchCapacity(day)));
  return {
    maleCapacity: snapshots[0]?.maleCapacity ?? 0,
    femaleCapacity: snapshots[0]?.femaleCapacity ?? 0,
    availableMale: Math.min(...snapshots.map((s) => s.availableMale)),
    availableFemale: Math.min(...snapshots.map((s) => s.availableFemale)),
  };
}

export function toDateOnlyString(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value.slice(0, 10);
}

export function countDaysInRange(start: string, end: string): number {
  if (!start || !end) return 0;
  return eachGregorianDay(start, end).length;
}

export function isWithinMaxReservationDays(
  start: string,
  end: string,
  maxDays?: number | null,
): boolean {
  if (!maxDays) return true;
  return countDaysInRange(start, end) <= maxDays;
}

export function isOnOrAfterServiceStart(
  reservationStart: string,
  serviceStartDate?: string | null,
): boolean {
  const serviceStart = toDateOnlyString(serviceStartDate);
  if (!serviceStart || !reservationStart) return true;
  return reservationStart >= serviceStart;
}
