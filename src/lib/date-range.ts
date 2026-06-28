/** Today as YYYY-MM-DD in local timezone. */
export function todayGregorian(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addGregorianDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Default capacity view: 7 days starting today. */
export function defaultCapacityRange(): { startDate: string; endDate: string } {
  const startDate = todayGregorian();
  return {
    startDate,
    endDate: addGregorianDays(startDate, 6),
  };
}

export function countDaysInclusive(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return diff + 1;
}

export function isRangeWithinBounds(
  startDate: string,
  endDate: string,
  minDate: string,
  maxDate: string,
): boolean {
  return startDate >= minDate && endDate <= maxDate && endDate >= startDate;
}

export function isOnOrAfterServiceStart(
  reservationStart: string,
  serviceStartDate: string,
): boolean {
  return reservationStart.slice(0, 10) >= serviceStartDate.slice(0, 10);
}

export function isWithinMaxReservationDays(
  startDate: string,
  endDate: string,
  maxDays: number,
): boolean {
  return countDaysInclusive(startDate, endDate) <= maxDays;
}
