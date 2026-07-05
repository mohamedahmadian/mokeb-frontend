export type PilgrimCardWeekdayId =
  | 'saturday'
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday';

export interface PilgrimCardWeekdayAccent {
  id: PilgrimCardWeekdayId;
  /** نام روز به فارسی، مثلاً «شنبه» */
  label: string;
  /** پس‌زمینه بنر و قاب */
  color: string;
  /** حاشیه بیرونی قاب */
  borderColor: string;
  /** نشانگر گوشه — پررنگ‌تر از قاب */
  accentColor: string;
  /** متن روی بنر */
  textOnColor: string;
}

/** JavaScript getDay(): 0=یکشنبه … 6=شنبه */
const WEEKDAY_ACCENTS: PilgrimCardWeekdayAccent[] = [
  {
    id: 'sunday',
    label: 'یکشنبه',
    color: '#D6E8FA',
    borderColor: '#7BA8DC',
    accentColor: '#2563EB',
    textOnColor: '#1E4A8C',
  },
  {
    id: 'monday',
    label: 'دوشنبه',
    color: '#E0E7EF',
    borderColor: '#8B9CB3',
    accentColor: '#475569',
    textOnColor: '#334155',
  },
  {
    id: 'tuesday',
    label: 'سه‌شنبه',
    color: '#C5E8D0',
    borderColor: '#5CB87A',
    accentColor: '#15803D',
    textOnColor: '#14532D',
  },
  {
    id: 'wednesday',
    label: 'چهارشنبه',
    color: '#F5DFC4',
    borderColor: '#D4925C',
    accentColor: '#C2410C',
    textOnColor: '#7C2D12',
  },
  {
    id: 'thursday',
    label: 'پنج‌شنبه',
    color: '#E4D4F8',
    borderColor: '#A78BDA',
    accentColor: '#7C3AED',
    textOnColor: '#5B21B6',
  },
  {
    id: 'friday',
    label: 'جمعه',
    color: '#F5D0D0',
    borderColor: '#E07070',
    accentColor: '#DC2626',
    textOnColor: '#991B1B',
  },
  {
    id: 'saturday',
    label: 'شنبه',
    color: '#F0E4B0',
    borderColor: '#C9A84A',
    accentColor: '#B45309',
    textOnColor: '#78350F',
  },
];

/** رنگ و برچسب روز هفته برای قاب زائر کارت. */
export function getPilgrimCardWeekdayAccent(
  date: Date = new Date(),
): PilgrimCardWeekdayAccent {
  return WEEKDAY_ACCENTS[date.getDay()];
}

function parseLocalDateOnly(isoDate: string): Date | null {
  const trimmed = isoDate.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** رنگ قاب بر اساس تاریخ شروع اقامت (YYYY-MM-DD). */
export function getPilgrimCardWeekdayAccentForStayStart(
  reservationDate: string,
): PilgrimCardWeekdayAccent {
  const parsed = parseLocalDateOnly(reservationDate);
  return getPilgrimCardWeekdayAccent(parsed ?? new Date());
}

/** برچسب روز هفته برای یک تاریخ ISO (YYYY-MM-DD). */
export function getPilgrimCardWeekdayLabelForDate(
  isoDate: string,
): string {
  const parsed = parseLocalDateOnly(isoDate);
  return getPilgrimCardWeekdayAccent(parsed ?? new Date()).label;
}

/** روزهای شروع و پایان اقامت، مثلاً «سه‌شنبه - چهارشنبه». */
export function formatPresenceStayWeekdays(
  reservationDate: string,
  reservationEndDate?: string | null,
): string {
  const start = reservationDate.trim().slice(0, 10);
  const end = (reservationEndDate ?? reservationDate).trim().slice(0, 10);
  const startLabel = getPilgrimCardWeekdayLabelForDate(start);
  const endLabel = getPilgrimCardWeekdayLabelForDate(end);
  if (startLabel === endLabel) return startLabel;
  return `${startLabel} - ${endLabel}`;
}
