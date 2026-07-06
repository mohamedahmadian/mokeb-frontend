export const DEFAULT_CHECK_IN_TIME = '14:00';
export const DEFAULT_CHECK_OUT_TIME = '11:00';

export type TimePeriod = 'am' | 'pm';

export const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  am: 'ق.ظ',
  pm: 'ب.ظ',
};

export const TIME_PERIOD_LABELS_LONG: Record<TimePeriod, string> = {
  am: 'قبل از ظهر',
  pm: 'بعد از ظهر',
};

export function parseTime24(value?: string | null): {
  hour12: number;
  minute: number;
  period: TimePeriod;
} {
  const normalized = normalizeTimeValue(value) || '12:00';
  const [hStr, mStr] = normalized.split(':');
  const h24 = Number(hStr);
  const minute = Number(mStr);
  const period: TimePeriod = h24 >= 12 ? 'pm' : 'am';
  const hour12 = h24 % 12 || 12;
  return { hour12, minute, period };
}

export function buildTime24(
  hour12: number,
  minute: number,
  period: TimePeriod,
): string {
  let h24: number;
  if (period === 'am') {
    h24 = hour12 === 12 ? 0 : hour12;
  } else {
    h24 = hour12 === 12 ? 12 : hour12 + 12;
  }
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function normalizeTimeValue(value?: string | null): string {
  if (!value) return '';
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour);

export function parseHourFromTimeValue(value?: string | null): number {
  const normalized = normalizeTimeValue(value);
  if (!normalized) return 0;
  const hour = Number(normalized.split(':')[0]);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return 0;
  return hour;
}

export function buildTimeFromHour(hour: number): string {
  const safeHour = Math.min(23, Math.max(0, hour));
  return `${String(safeHour).padStart(2, '0')}:00`;
}

/** نمایش عدد ساعت با ارقام فارسی — مثلاً ۱۴ */
export function formatHourFa(hour: number): string {
  return hour.toLocaleString('fa-IR');
}

export function formatTimeFa(value?: string | null): string {
  const normalized = normalizeTimeValue(value);
  if (!normalized) return '—';
  const [h, m] = normalized.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTimeFa(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeFromIso(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Actual check-in time if recorded; otherwise planned or mawkib default. */
export function resolveReservationCheckInTime(
  actualAt?: string | null,
  plannedTime?: string | null,
  defaultTime?: string | null,
): string {
  if (actualAt) {
    return formatTimeFromIso(actualAt) || '—';
  }
  return formatTimeFa(plannedTime ?? defaultTime ?? DEFAULT_CHECK_IN_TIME);
}

/** Actual check-out time if recorded; otherwise planned or mawkib default. */
export function resolveReservationCheckOutTime(
  actualAt?: string | null,
  plannedTime?: string | null,
  defaultTime?: string | null,
): string {
  if (actualAt) {
    return formatTimeFromIso(actualAt) || '—';
  }
  return formatTimeFa(plannedTime ?? defaultTime ?? DEFAULT_CHECK_OUT_TIME);
}

export function currentTimeInputValue(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function formatLiveClockFa(date = new Date()): string {
  return date.toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function timeInputValueFromIso(value?: string | null): string {
  if (!value) return currentTimeInputValue();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return currentTimeInputValue();
  return currentTimeInputValue(date);
}

export function buildRecordedAtFromTime(time: string, baseDate = new Date()): string {
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    throw new Error('زمان نامعتبر است');
  }
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    throw new Error('زمان نامعتبر است');
  }
  const date = new Date(baseDate);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
}

export function dateInputValueFromIso(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayLocalGregorianDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function clampDateString(
  value: string,
  min: string,
  max: string,
): string {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function buildRecordedAtFromDateAndTime(
  dateStr: string,
  time: string,
  refDate = new Date(),
): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    throw new Error('زمان نامعتبر است');
  }
  const h = Number(match[1]);
  const min = Number(match[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) {
    throw new Error('زمان نامعتبر است');
  }
  const sameMinute =
    h === refDate.getHours() && min === refDate.getMinutes();
  const seconds = sameMinute ? refDate.getSeconds() : 0;
  const ms = sameMinute ? refDate.getMilliseconds() : 0;
  return new Date(y, m - 1, d, h, min, seconds, ms).toISOString();
}
