import { formatPersianDateRange } from '../ui/PersianDateRangePicker';
import type { Reservation } from '../../types';

interface ReservationLookupMatchesBarProps {
  matches: Reservation[];
  selectedId: number;
  onSelect: (reservation: Reservation) => void;
}

function matchBadgeLabel(reservation: Reservation): string {
  const endDate = reservation.reservationEndDate ?? reservation.reservationDate;
  const range = formatPersianDateRange(
    reservation.reservationDate.slice(0, 10),
    endDate.slice(0, 10),
  );
  const mobile =
    reservation.pilgrimMobile?.trim() ||
    reservation.pilgrim.mobileNumber?.trim() ||
    '—';
  return `${reservation.pilgrim.fullName} · ${mobile} · ${reservation.trackingCode} · ${range}`;
}

function reservationMobile(reservation: Reservation): string {
  return (
    reservation.pilgrimMobile?.trim() ||
    reservation.pilgrim.mobileNumber?.trim() ||
    '—'
  );
}

export function ReservationLookupMatchesBar({
  matches,
  selectedId,
  onSelect,
}: ReservationLookupMatchesBarProps) {
  if (matches.length <= 1) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="space-y-2 p-2.5 sm:p-3">
        <p className="text-[11px] font-medium text-slate-600">
          {matches.length.toLocaleString('fa-IR')} نتیجه مشابه — یکی را انتخاب کنید
        </p>
        <div className="grid grid-cols-6 gap-1.5">
          {matches.map((reservation) => {
            const isActive = reservation.id === selectedId;
            const mobile = reservationMobile(reservation);

            return (
              <button
                key={reservation.id}
                type="button"
                title={matchBadgeLabel(reservation)}
                onClick={() => onSelect(reservation)}
                className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ring-1 transition sm:text-[11px] ${
                  isActive
                    ? 'bg-[#4a6fa5] text-white ring-[#4a6fa5]/40 shadow-sm'
                    : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50 hover:ring-[#c5d4e8]'
                }`}
              >
                <span className="min-w-0 truncate">{reservation.pilgrim.fullName}</span>
                <span
                  className={`shrink-0 font-mono text-[9px] sm:text-[10px] ${
                    isActive ? 'text-white/90' : 'text-slate-500'
                  }`}
                  dir="ltr"
                >
                  {mobile}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function mergeLookupMatches(
  reservation: Reservation | null,
  alternatives: Reservation[],
): Reservation[] {
  if (!reservation) return [];
  const seen = new Set<number>();
  const merged: Reservation[] = [];

  for (const item of [reservation, ...alternatives]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }

  return merged;
}
