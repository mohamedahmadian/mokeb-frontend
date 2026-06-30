import { isMawkibOnlineReservationEnabled } from '../../lib/mawkib-online-reservation';
import type { Mawkib } from '../../types';

const badgeClass =
  'inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1';

interface MawkibReservationTypeBadgesProps {
  mawkib: Pick<Mawkib, 'onlineReservationEnabled'>;
  className?: string;
}

export function MawkibReservationTypeBadges({
  mawkib,
  className = '',
}: MawkibReservationTypeBadgesProps) {
  const onlineEnabled = isMawkibOnlineReservationEnabled(mawkib);

  if (!onlineEnabled) {
    return (
      <span
        className={`${badgeClass} bg-amber-50 text-amber-800 ring-amber-200 ${className}`}
      >
        رزرو صرفا حضوری
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className={`${badgeClass} bg-slate-100 text-slate-700 ring-slate-200`}>
        رزرو حضوری
      </span>
      <span className={`${badgeClass} bg-emerald-50 text-emerald-700 ring-emerald-200`}>
        رزرو آنلاین
      </span>
    </span>
  );
}
