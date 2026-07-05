import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatPersianDateRange } from '../ui/PersianDateRangePicker';
import { formatPersianDateTimeFromIso } from '../ui/PersianDateInput';
import { NavIcon, type NavIconName } from '../ui/NavIcons';
import { GuestCountBadges } from './GuestCountBadges';
import type { Reservation } from '../../types';

function PhoneIcon({ className = 'h-3 w-3' }: { className?: string }) {
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
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

function MetaField({
  icon,
  navIcon,
  label,
  value,
  dir,
}: {
  icon?: ReactNode;
  navIcon?: NavIconName;
  label: string;
  value: ReactNode;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-400 ring-1 ring-slate-100">
        {navIcon ? (
          <NavIcon name={navIcon} className="h-3.5 w-3.5" strokeWidth={1.75} />
        ) : (
          icon
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-medium leading-none text-slate-400">{label}</p>
        <p
          className={`mt-0.5 text-[11px] font-semibold leading-tight text-slate-800 ${dir === 'ltr' ? 'font-mono truncate' : ''}`}
          dir={dir}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

const actionBtnBase =
  'inline-flex items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition disabled:opacity-50';

export function PendingReservationCard({
  reservation,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  reservation: Reservation;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const endDate = reservation.reservationEndDate ?? reservation.reservationDate;
  const createdAtLabel = formatPersianDateTimeFromIso(reservation.createdAt);
  const isBusy = isApproving || isRejecting;
  const stayRange = formatPersianDateRange(
    reservation.reservationDate.slice(0, 10),
    endDate.slice(0, 10),
  );
  const guestCount = (
    <GuestCountBadges
      male={reservation.maleGuestCount}
      female={reservation.femaleGuestCount}
    />
  );

  return (
    <div className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="p-2.5 sm:p-3">
        <div className="mb-2 flex min-w-0 items-start gap-2">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5] ring-1 ring-[#c5d4e8]/60">
            <NavIcon name="pilgrims" className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">
              {reservation.pilgrim.fullName}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500">
              <NavIcon name="mawkibs" className="h-3 w-3 shrink-0 text-slate-400" />
              <span className="truncate">{reservation.mawkib.name}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
          <MetaField
            navIcon="todayReserve"
            label="تاریخ ثبت"
            value={createdAtLabel}
          />
          <MetaField navIcon="reserve" label="اقامت" value={stayRange} />
          <MetaField navIcon="pilgrims" label="تعداد" value={guestCount} />
          <MetaField
            icon={<PhoneIcon />}
            label="موبایل"
            value={reservation.pilgrim.mobileNumber}
            dir="ltr"
          />
          <MetaField
            navIcon="track"
            label="پیگیری"
            value={reservation.trackingCode}
            dir="ltr"
          />
        </div>

        {reservation.description?.trim() && (
          <p className="mt-1.5 line-clamp-1 rounded-lg border border-slate-100 bg-slate-50/60 px-2 py-1 text-[11px] text-slate-600">
            <span className="font-medium text-slate-400">توضیح: </span>
            {reservation.description}
          </p>
        )}

        <div className="mt-2 flex flex-row items-center justify-end gap-1 border-t border-slate-100 pt-2">
          <button
            type="button"
            onClick={onApprove}
            disabled={isBusy}
            className={`${actionBtnBase} bg-[#4a6fa5] text-white hover:bg-[#3d5d8a]`}
          >
            <NavIcon name="check" className="h-3 w-3" strokeWidth={2} />
            {isApproving ? '...' : 'تایید'}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isBusy}
            className={`${actionBtnBase} bg-red-600 text-white hover:bg-red-700`}
          >
            <NavIcon name="x" className="h-3 w-3" strokeWidth={2} />
            {isRejecting ? '...' : 'رد'}
          </button>
          <Link
            to={`/reservations/${reservation.id}`}
            className={`${actionBtnBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
          >
            <NavIcon name="info" className="h-3 w-3" strokeWidth={2} />
            جزئیات
          </Link>
        </div>
      </div>
    </div>
  );
}
