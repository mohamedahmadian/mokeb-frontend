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

export function normalizeDateOnly(value?: string | null): string | undefined {
  if (!value) return undefined;
  return value.slice(0, 10);
}

export type CapacityDateBounds = {
  minDate: string;
  maxDate: string;
  isServicePeriod: boolean;
};

/** Effective selectable range: mawkib service period, or inventory horizon fallback. */
export function getCapacityDateBounds(
  serviceStartDate?: string | null,
  serviceEndDate?: string | null,
  fallbackHorizon?: { minDate: string; maxDate: string },
): CapacityDateBounds | null {
  const serviceStart = normalizeDateOnly(serviceStartDate);
  const serviceEnd = normalizeDateOnly(serviceEndDate);

  if (serviceStart && serviceEnd) {
    if (serviceStart > serviceEnd) return null;
    return { minDate: serviceStart, maxDate: serviceEnd, isServicePeriod: true };
  }

  if (fallbackHorizon) {
    return { ...fallbackHorizon, isServicePeriod: false };
  }

  return null;
}

/** Default capacity view: up to 7 days within the allowed bounds. */
export function defaultCapacityRange(bounds?: CapacityDateBounds): {
  startDate: string;
  endDate: string;
} {
  if (!bounds) {
    const startDate = todayGregorian();
    return { startDate, endDate: addGregorianDays(startDate, 6) };
  }

  const today = todayGregorian();
  let startDate = bounds.minDate;
  if (today > startDate && today <= bounds.maxDate) {
    startDate = today;
  }
  let endDate = addGregorianDays(startDate, 6);
  if (endDate > bounds.maxDate) {
    endDate = bounds.maxDate;
  }
  if (startDate > endDate) {
    startDate = endDate;
  }
  return { startDate, endDate };
}

export function countDaysInclusive(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return diff + 1;
}

/** Calendar-day span between start and end (checkout day minus check-in day). */
export function reservationStayDayCount(
  startDate: string,
  endDate: string,
): number {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
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

export const STAY_DURATION_PRESETS = [1, 2, 3, 4, 5] as const;

export type StayDurationPreset = (typeof STAY_DURATION_PRESETS)[number];

/** Earliest allowed check-in: today or mawkib service start, whichever is later. */
export function effectiveStayStartDate(
  today: string,
  serviceStartDate?: string | null,
): string {
  const serviceStart = normalizeDateOnly(serviceStartDate);
  if (serviceStart && serviceStart > today) return serviceStart;
  return today;
}

/** Preset stay lengths (1–5 days) allowed for the selected mawkib. */
export function getAvailableStayDurations(
  minDays?: number | null,
  maxDays?: number | null,
): StayDurationPreset[] {
  const min = effectiveDefaultReservationDays(minDays);
  const max = Math.min(5, effectiveMaxReservationDays(maxDays));
  return STAY_DURATION_PRESETS.filter((days) => days >= min && days <= max);
}

/** Default max reservation span in days (one week). */
export const DEFAULT_MAWKIB_MAX_RESERVATION_DAYS = 7;

/** Default stay length in days when creating a reservation. */
export const DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS = 1;

/** @deprecated Use {@link DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS} */
export const DEFAULT_MAWKIB_RESERVATION_DAYS =
  DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS;

export function isWithinMaxReservationDays(
  startDate: string,
  endDate: string,
  maxDays: number,
): boolean {
  return reservationStayDayCount(startDate, endDate) <= maxDays;
}

/** Effective default span in days (minimum 1). */
export function effectiveDefaultReservationDays(
  value?: number | null,
): number {
  return value != null && value >= 1
    ? value
    : DEFAULT_MAWKIB_DEFAULT_RESERVATION_DAYS;
}

/** Effective max reservation span in days (minimum 1). */
export function effectiveMaxReservationDays(
  value?: number | null,
): number {
  return value != null && value >= 1
    ? value
    : DEFAULT_MAWKIB_MAX_RESERVATION_DAYS;
}

/**
 * Checkout date for a stay of N day(s) starting on `startDate`.
 * One day means check-in on start and check-out the next calendar day.
 */
export function defaultReservationEndDate(
  startDate: string,
  defaultDays?: number | null,
): string {
  const span = effectiveDefaultReservationDays(defaultDays);
  return addGregorianDays(startDate, span);
}

/** Occupied nights for capacity checks — check-in through day before checkout. */
export function buildReservationOccupiedDates(
  startDate: string,
  endDate: string,
): string[] {
  const nights = reservationStayDayCount(startDate, endDate);
  if (nights <= 0) {
    return [];
  }
  return buildInclusiveDateRange(startDate, nights);
}

/** Inclusive list of YYYY-MM-DD strings from start for `dayCount` days. */
export function buildInclusiveDateRange(
  startDate: string,
  dayCount: number,
): string[] {
  const span = Math.max(1, dayCount);
  return Array.from({ length: span }, (_, index) =>
    addGregorianDays(startDate, index),
  );
}
