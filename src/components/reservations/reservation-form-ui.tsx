import type { ReactNode } from 'react';
import { formatPersianNumber } from '../../lib/capacity';
import { guestTheme } from '../../lib/guest-theme';

export {
  MawkibCard,
  MawkibInfoCard,
  MawkibGuestGalleryDetailsFooter,
  MawkibGuestGalleryButton,
  MawkibGuestMapButton,
  mawkibCapacitySnapshot,
} from '../mawkibs/MawkibInfoCard';

export function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function IconUser() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

export function IconPhone() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

export function IconCalendar() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

export function IconHome() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

export function IconUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

export function IconChat() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  );
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800 sm:text-lg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function NoFemaleAcceptanceHint() {
  return (
    <div className="flex items-end sm:min-h-[4.75rem]">
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-pink-50 px-2 py-1 text-[11px] font-medium text-pink-500 ring-1 ring-inset ring-pink-100">
        <svg
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.75}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
        عدم پذیرش بانوان
      </span>
    </div>
  );
}

export function GuestCountCapacityBadge({
  available,
  variant = 'male',
}: {
  available: number;
  variant?: 'male' | 'female';
}) {
  if (available <= 0) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600 ring-1 ring-red-100">
        (تکمیل ظرفیت)
      </span>
    );
  }

  const tone =
    variant === 'male'
      ? 'bg-sky-50 text-sky-700 ring-sky-100'
      : 'bg-pink-50 text-pink-600 ring-pink-100';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${tone}`}
    >
      ({formatPersianNumber(available)} ظرفیت خالی)
    </span>
  );
}

function GuestCountIconMale({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function GuestCountIconFemale({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

export function GuestCountQuickPick({
  onPickMale,
  onPickFemale,
  maleActive,
  femaleActive,
  maleDisabled = false,
  femaleDisabled = false,
}: {
  onPickMale: () => void;
  onPickFemale: () => void;
  maleActive?: boolean;
  femaleActive?: boolean;
  maleDisabled?: boolean;
  femaleDisabled?: boolean;
}) {
  if (maleDisabled && femaleDisabled) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
      {!maleDisabled && (
        <button
          type="button"
          onClick={onPickMale}
          aria-pressed={maleActive}
          className={`group inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all active:scale-[0.98] ${
            maleActive
              ? 'border-sky-300 bg-gradient-to-b from-sky-50 to-sky-100/80 text-sky-900 shadow-sm ring-2 ring-sky-200/70'
              : 'border-slate-200/90 bg-white text-slate-600 shadow-sm hover:border-sky-200 hover:bg-sky-50/60 hover:text-sky-800'
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
              maleActive
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-sky-100 text-sky-600 group-hover:bg-sky-200/80'
            }`}
          >
            <GuestCountIconMale className="h-3.5 w-3.5" />
          </span>
          <span>آقا</span>
        </button>
      )}
      {!femaleDisabled && (
        <button
          type="button"
          onClick={onPickFemale}
          aria-pressed={femaleActive}
          className={`group inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all active:scale-[0.98] ${
            femaleActive
              ? 'border-pink-300 bg-gradient-to-b from-pink-50 to-pink-100/80 text-pink-900 shadow-sm ring-2 ring-pink-200/70'
              : 'border-slate-200/90 bg-white text-slate-600 shadow-sm hover:border-pink-200 hover:bg-pink-50/60 hover:text-pink-800'
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors ${
              femaleActive
                ? 'bg-pink-500 text-white shadow-sm'
                : 'bg-pink-100 text-pink-600 group-hover:bg-pink-200/80'
            }`}
          >
            <GuestCountIconFemale className="h-3.5 w-3.5" />
          </span>
          <span>خانم</span>
        </button>
      )}
    </div>
  );
}

const STAY_DURATION_OPTIONS = [1, 2, 3, 4] as const;

const STAY_DURATION_LABELS: Record<(typeof STAY_DURATION_OPTIONS)[number], string> = {
  1: 'یک‌روزه',
  2: 'دو‌روزه',
  3: 'سه‌روزه',
  4: 'چهار‌روزه',
};

export function StayDurationQuickPick({
  onSelect,
  isActive,
  isDisabled,
}: {
  onSelect: (days: number) => void;
  isActive: (days: number) => boolean;
  isDisabled?: (days: number) => boolean;
}) {
  const visibleOptions = STAY_DURATION_OPTIONS.filter(
    (days) => !(isDisabled?.(days) ?? false),
  );

  if (visibleOptions.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
      {visibleOptions.map((days) => {
        const active = isActive(days);

        return (
          <button
            key={days}
            type="button"
            onClick={() => onSelect(days)}
            aria-pressed={active}
            className={`group inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-sm font-medium transition-all active:scale-[0.98] sm:px-3 ${
              active
                ? 'border-[#c5d4e8] bg-gradient-to-b from-[#f0f4fa] to-[#e8eef6] text-[#4a6fa5] shadow-sm ring-2 ring-[#c5d4e8]/80'
                : 'border-slate-200/90 bg-white text-slate-600 shadow-sm hover:border-[#c5d4e8] hover:bg-[#f0f4fa]/70 hover:text-[#4a6fa5]'
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                active
                  ? 'bg-[#4a6fa5] text-white shadow-sm'
                  : 'bg-[#e8eef6] text-[#4a6fa5] group-hover:bg-[#dbe4f0]'
              }`}
            >
              {formatPersianNumber(days)}
            </span>
            <span>{STAY_DURATION_LABELS[days]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function GuestCountStepper({
  value,
  onChange,
  max,
  min = 0,
  label,
  labelSuffix,
  disabled = false,
  compact = false,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  min?: number;
  label: string;
  labelSuffix?: ReactNode;
  disabled?: boolean;
  compact?: boolean;
}) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => {
    const next = value + 1;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  const buttonClass = compact
    ? 'flex h-9 w-9 items-center justify-center rounded-xl border text-base font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40'
    : 'flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-700 transition hover:border-[#c5d4e8] hover:bg-[#f0f4fa] disabled:opacity-40';

  const minusClass = compact
    ? `${buttonClass} border-slate-200/90 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100`
    : `${buttonClass} border-slate-200 bg-white text-slate-700 hover:border-[#c5d4e8] hover:bg-[#f0f4fa]`;

  const plusClass = compact
    ? `${buttonClass} border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:border-[#4a6fa5]/40 hover:bg-[#e8eef6]`
    : `${buttonClass} border-slate-200 bg-white text-slate-700 hover:border-[#c5d4e8] hover:bg-[#f0f4fa]`;

  const inputClass = compact
    ? 'h-9 w-11 rounded-xl border border-slate-200/90 bg-white text-center text-base font-bold tabular-nums text-slate-800 shadow-inner focus:border-[#4a6fa5] focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/15 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
    : 'h-11 w-20 rounded-xl border border-slate-200 text-center text-lg font-semibold text-slate-800 focus:border-[#4a6fa5] focus:outline-none';

  return (
    <div className={disabled ? 'opacity-50' : undefined}>
      <span className="mb-2 flex flex-wrap items-center gap-x-1.5 text-sm text-slate-600">
        <span>{label}</span>
        {labelSuffix}
      </span>
      <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
        <button
          type="button"
          onClick={increment}
          disabled={disabled || (max !== undefined && value >= max)}
          className={plusClass}
          aria-label="افزایش"
        >
          +
        </button>
        <input
          type="number"
          min={min}
          {...(max !== undefined ? { max } : {})}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            if (disabled) return;
            const n = parseInt(e.target.value, 10);
            if (Number.isNaN(n) || n < min) onChange(min);
            else if (max !== undefined && n > max) onChange(max);
            else onChange(n);
          }}
          className={inputClass}
        />
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || value <= min}
          className={minusClass}
          aria-label="کاهش"
        >
          −
        </button>
        <span className={`text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>نفر</span>
      </div>
    </div>
  );
}

export const reservationFormInputClass = guestTheme.input;

export function StayDateAlignAlert({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"
    >
      {message}
    </div>
  );
}

export function FieldValidationErrorIcon({
  title,
  className = "h-5 w-5",
}: {
  title: string;
  className?: string;
}) {
  return (
    <svg
      className={`${className} text-red-500`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <title>{title}</title>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}
