import {
  effectiveStayStartDate,
  getAvailableStayDurations,
  reservationStayDayCount,
  type StayDurationPreset,
} from '../../lib/date-range';
import { formatPersianNumber } from '../../lib/capacity';

const DURATION_LABELS: Record<StayDurationPreset, string> = {
  1: 'یک‌روزه',
  2: 'دو‌روزه',
  3: 'سه‌روزه',
  4: 'چهار‌روزه',
  5: 'پنج‌روزه',
};

function CalendarDayIcon({ days }: { days: StayDurationPreset }) {
  return (
    <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
      <svg
        className="h-7 w-7 text-current opacity-90"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
      <span className="absolute bottom-0.5 text-[10px] font-bold leading-none">
        {formatPersianNumber(days)}
      </span>
    </span>
  );
}

interface StayDurationPickerProps {
  today: string;
  dateStart: string;
  dateEnd: string;
  serviceStartDate?: string | null;
  defaultReservationDays?: number | null;
  maxReservationDays?: number | null;
  mawkibSelected: boolean;
  onSelect: (days: StayDurationPreset) => void;
}

export function StayDurationPicker({
  today,
  dateStart,
  dateEnd,
  serviceStartDate,
  defaultReservationDays,
  maxReservationDays,
  mawkibSelected,
  onSelect,
}: StayDurationPickerProps) {
  const availableDurations = mawkibSelected
    ? getAvailableStayDurations(defaultReservationDays, maxReservationDays)
    : getAvailableStayDurations(1, 5);

  const expectedStart = effectiveStayStartDate(today, serviceStartDate);
  const stayDays = reservationStayDayCount(dateStart, dateEnd);
  const activePreset =
    dateStart === expectedStart &&
    availableDurations.includes(stayDays as StayDurationPreset)
      ? (stayDays as StayDurationPreset)
      : null;

  if (availableDurations.length === 0) {
    return (
      <p className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-800">
        بازهٔ پیش‌فرض این موکب خارج از گزینه‌های سریع (۱ تا ۵ روز) است؛ لطفاً
        تاریخ‌ها را دستی انتخاب کنید.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600">مدت اقامت</p>
      <div className="flex flex-wrap gap-2">
        {availableDurations.map((days) => {
          const isActive = activePreset === days;
          return (
            <button
              key={days}
              type="button"
              onClick={() => onSelect(days)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/25 ${
                isActive
                  ? 'border-[#4a6fa5] bg-[#f0f4fa] text-[#3d5d8a] shadow-sm ring-1 ring-[#c5d4e8]/80'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-[#c5d4e8] hover:bg-[#f8fafc] hover:text-[#4a6fa5]'
              }`}
            >
              <CalendarDayIcon days={days} />
              <span>{DURATION_LABELS[days]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
