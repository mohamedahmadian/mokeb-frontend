import type { ReactNode } from 'react';
import { formatPersianNumber } from '../../lib/capacity';

const iconClass = 'h-3 w-3 shrink-0';

function IconMale({ className = iconClass }: { className?: string }) {
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

function IconFemale({ className = iconClass }: { className?: string }) {
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

function IconTotal({ className = iconClass }: { className?: string }) {
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
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function TooltipRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone: 'sky' | 'rose' | 'slate';
}) {
  const toneClass = {
    sky: 'text-sky-700',
    rose: 'text-rose-700',
    slate: 'text-slate-700',
  }[tone];

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
        <span className={toneClass}>{icon}</span>
        {label}
      </span>
      <span className={`text-xs font-bold tabular-nums ${toneClass}`}>
        {formatPersianNumber(value)}
      </span>
    </div>
  );
}

function GuestCountTooltip({
  male,
  female,
  total,
}: {
  male: number;
  female: number;
  total: number;
}) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-[100] w-44 -translate-x-1/2 scale-95 rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 opacity-0 shadow-lg shadow-slate-200/60 ring-1 ring-slate-100 transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
    >
      <p className="mb-2 border-b border-slate-100 pb-1.5 text-center text-[10px] font-semibold text-slate-500">
        جزئیات تعداد مهمان
      </p>
      <div className="space-y-1.5">
        <TooltipRow
          icon={<IconMale className="h-3.5 w-3.5" />}
          label="آقایان"
          value={male}
          tone="sky"
        />
        <TooltipRow
          icon={<IconFemale className="h-3.5 w-3.5" />}
          label="بانوان"
          value={female}
          tone="rose"
        />
        <div className="border-t border-slate-100 pt-1.5">
          <TooltipRow
            icon={<IconTotal className="h-3.5 w-3.5" />}
            label="مجموع"
            value={total}
            tone="slate"
          />
        </div>
      </div>
      <div
        className="absolute bottom-full left-1/2 h-0 w-0 -translate-x-1/2 border-[6px] border-transparent border-b-white"
        aria-hidden
      />
      <div
        className="absolute bottom-full left-1/2 mb-px h-0 w-0 -translate-x-1/2 border-[7px] border-transparent border-b-slate-200/90"
        aria-hidden
      />
    </div>
  );
}

export interface GuestCountBadgesProps {
  male: number;
  female: number;
  className?: string;
  showTooltip?: boolean;
}

export function GuestCountBadges({
  male,
  female,
  className = '',
  showTooltip = true,
}: GuestCountBadgesProps) {
  const total = male + female;

  if (total <= 0) {
    return (
      <span className={`text-xs text-slate-400 ${className}`.trim()}>۰</span>
    );
  }

  const showTotal = male > 0 && female > 0;

  return (
    <div
      className={`group relative inline-flex w-fit max-w-full outline-none ${className}`.trim()}
      tabIndex={showTooltip ? 0 : undefined}
      aria-label={`${male} آقا، ${female} بانو، مجموع ${total}`}
    >
      {showTooltip && (
        <GuestCountTooltip male={male} female={female} total={total} />
      )}

      <div
        className={`inline-flex w-fit max-w-full ${showTotal ? 'flex-col items-stretch gap-0.5' : 'items-center'}`}
      >
        <div className="inline-flex flex-wrap items-center justify-center gap-1">
          {male > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-sky-50 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-sky-800 ring-1 ring-sky-200/90">
              <IconMale />
              {formatPersianNumber(male)}
            </span>
          )}
          {female > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-rose-800 ring-1 ring-rose-200/90">
              <IconFemale />
              {formatPersianNumber(female)}
            </span>
          )}
        </div>

        {showTotal && (
          <>
            <div className="h-px w-full bg-slate-200/90" aria-hidden />
            <span className="inline-flex items-center justify-center gap-0.5 self-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-slate-700 ring-1 ring-slate-200/90">
              {formatPersianNumber(total)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/** Shortcut for reservation objects */
export function ReservationGuestCountBadges({
  reservation,
  className,
}: {
  reservation: { maleGuestCount: number; femaleGuestCount: number };
  className?: string;
}) {
  return (
    <GuestCountBadges
      male={reservation.maleGuestCount}
      female={reservation.femaleGuestCount}
      className={className}
    />
  );
}
