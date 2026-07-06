import {
  PRESENCE_STATE_LABELS,
  type ReservationPresenceState,
} from '../../lib/reservation-events';
import { btnAction } from '../../lib/styles';

const tempActionBtnBase = `${btnAction} inline-flex shrink-0 items-center justify-center gap-1.5 border !min-h-8 !px-2.5 !py-1.5 !text-[11px]`;

/** ورود موقت — کادر سبز ملایم */
export const tempInActionBtn = `${tempActionBtnBase} border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 ring-1 ring-emerald-200/70`;

/** خروج موقت — کادر صورتی ملایم */
export const tempOutActionBtn = `${tempActionBtnBase} border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 ring-1 ring-rose-200/70`;

export const presenceBadgeColors: Record<ReservationPresenceState, string> = {
  NOT_ARRIVED: 'bg-slate-100 text-slate-600 ring-slate-200',
  PRESENT: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  TEMPORARILY_OUT: 'bg-rose-100 text-rose-800 ring-rose-200',
  LEFT: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function getPresenceCardClass(presence?: ReservationPresenceState): string {
  const base =
    'w-full overflow-hidden rounded-xl border bg-white transition-shadow';

  switch (presence) {
    case 'PRESENT':
      return `${base} border-emerald-300/90 shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_4px_16px_-4px_rgba(16,185,129,0.35)]`;
    case 'TEMPORARILY_OUT':
      return `${base} border-rose-300/90 shadow-[0_0_0_1px_rgba(244,63,94,0.15),0_4px_16px_-4px_rgba(244,63,94,0.3)]`;
    default:
      return `${base} border-slate-200/80 shadow-sm`;
  }
}

export function PresenceBadge({ presence }: { presence: ReservationPresenceState }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1 ${presenceBadgeColors[presence]}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          presence === 'PRESENT'
            ? 'bg-emerald-500'
            : presence === 'TEMPORARILY_OUT'
              ? 'bg-rose-500'
              : 'bg-slate-400'
        }`}
      />
      {PRESENCE_STATE_LABELS[presence]}
    </span>
  );
}
