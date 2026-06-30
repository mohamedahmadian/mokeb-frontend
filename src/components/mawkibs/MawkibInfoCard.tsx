import type { ReactNode } from 'react';
import { MAWKIB_AMENITY_FIELDS } from './MawkibExtraFields';
import { formatPersianDate } from '../ui/PersianDateInput';
import {
  formatCapacityFractionLatin,
  mawkibAvailableFemale,
  mawkibAvailableMale,
} from '../../lib/capacity';
import { RemainingCapacityHint } from './RemainingCapacityHint';
import { MawkibReservationTypeBadges } from './MawkibReservationTypeBadges';
import type { Mawkib } from '../../types';

export function mawkibCapacitySnapshot(mawkib: Mawkib) {
  return {
    maleCapacity: mawkib.maleCapacity,
    femaleCapacity: mawkib.femaleCapacity,
    availableMale: mawkibAvailableMale(mawkib),
    availableFemale: mawkibAvailableFemale(mawkib),
  };
}

function CardSvgIcon({
  className = 'h-3.5 w-3.5',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const cardIcons = {
  mawkib: (
    <CardSvgIcon className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </CardSvgIcon>
  ),
  male: (
    <CardSvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </CardSvgIcon>
  ),
  female: (
    <CardSvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </CardSvgIcon>
  ),
  owner: (
    <CardSvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </CardSvgIcon>
  ),
  phone: (
    <CardSvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </CardSvgIcon>
  ),
  address: (
    <CardSvgIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </CardSvgIcon>
  ),
  calendar: (
    <CardSvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </CardSvgIcon>
  ),
  amenity: (
    <CardSvgIcon className="h-3 w-3">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </CardSvgIcon>
  ),
};

function CapacityPill({
  icon,
  label,
  available,
  total,
  tone,
}: {
  icon: ReactNode;
  label: string;
  available: number;
  total: number;
  tone: 'male' | 'female';
}) {
  const hasAvailability = available > 0;
  const toneClass =
    tone === 'male'
      ? 'bg-sky-50 text-sky-700 ring-sky-100'
      : 'bg-rose-50 text-rose-700 ring-rose-100';

  return (
    <span
      className={`inline-flex min-w-[8.5rem] flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-xs ring-1 ${toneClass}`}
    >
      <span className="text-[10px] font-medium opacity-80">{label}</span>
      <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
        <span className="opacity-80">{icon}</span>
        <span
          className={`font-mono font-bold tabular-nums ${hasAvailability ? '' : 'opacity-70'}`}
          title="رزرو شده / ظرفیت کل"
        >
          {formatCapacityFractionLatin(available, total)}
        </span>
        <RemainingCapacityHint
          available={available}
          numerals="latin"
          className="opacity-90"
          fullClassName="text-[10px] font-semibold text-red-600"
        />
      </span>
    </span>
  );
}

function CardIconBadge({ icon }: { icon: ReactNode }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0f4fa] text-[#4a6fa5]">
      {icon}
    </span>
  );
}

export function MawkibCapacityPills({ mawkib }: { mawkib: Mawkib }) {
  const capacity = mawkibCapacitySnapshot(mawkib);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CapacityPill
        icon={cardIcons.male}
        label="ظرفیت آقایان"
        available={capacity.availableMale}
        total={capacity.maleCapacity}
        tone="male"
      />
      <CapacityPill
        icon={cardIcons.female}
        label="ظرفیت بانوان"
        available={capacity.availableFemale}
        total={capacity.femaleCapacity}
        tone="female"
      />
    </div>
  );
}

function MawkibCardLabeledRow({
  icon,
  label,
  children,
  dir,
  className = '',
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  dir?: 'ltr' | 'rtl';
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-start gap-2 ${className}`}>
      <CardIconBadge icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-slate-400">{label}</p>
        <div className="text-xs font-medium leading-relaxed text-slate-700" dir={dir}>
          {children}
        </div>
      </div>
    </div>
  );
}

function getActiveAmenities(mawkib: Mawkib) {
  return MAWKIB_AMENITY_FIELDS.filter(({ key }) => Boolean(mawkib[key]));
}

function formatServiceDate(value?: string | null) {
  if (!value) return null;
  return formatPersianDate(value.slice(0, 10));
}

function MawkibInfoCardBody({
  mawkib,
  selectable,
  selected,
  showOnlineReservationStatus = true,
}: {
  mawkib: Mawkib;
  selectable: boolean;
  selected: boolean;
  showOnlineReservationStatus?: boolean;
}) {
  const ownerName = mawkib.owner?.fullName?.trim();
  const contactPhone = (mawkib.phoneNumber || mawkib.owner?.mobileNumber)?.trim();
  const serviceStart = formatServiceDate(mawkib.serviceStartDate);
  const serviceEnd = formatServiceDate(mawkib.serviceEndDate);
  const showServiceDates = Boolean(serviceStart && serviceEnd);
  const amenities = getActiveAmenities(mawkib);
  const address = mawkib.address?.trim();

  return (
    <>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <CardIconBadge icon={cardIcons.mawkib} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-bold text-slate-800">{mawkib.name}</p>
              {showOnlineReservationStatus && (
                <MawkibReservationTypeBadges mawkib={mawkib} />
              )}
            </div>
          </div>
          {selectable && (
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                selected ? 'border-[#4a6fa5] bg-[#4a6fa5]' : 'border-slate-300 bg-white'
              }`}
              aria-hidden
            >
              {selected && (
                <svg
                  className="h-3.5 w-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
          )}
        </div>

        <div className="mt-3">
          <MawkibCapacityPills mawkib={mawkib} />
        </div>

        {showServiceDates && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f8fafc] px-3 py-2 ring-1 ring-slate-100">
            <span className="text-[#4a6fa5]">{cardIcons.calendar}</span>
            <span className="text-xs font-medium text-slate-700">{serviceStart}</span>
            <span className="text-slate-300" aria-hidden>
              ←
            </span>
            <span className="text-xs font-medium text-slate-700">{serviceEnd}</span>
          </div>
        )}
      </div>

      {(ownerName || contactPhone || address) && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ownerName && (
              <MawkibCardLabeledRow icon={cardIcons.owner} label="مسئول موکب">
                {ownerName}
              </MawkibCardLabeledRow>
            )}
            {contactPhone && (
              <MawkibCardLabeledRow icon={cardIcons.phone} label="شماره تماس" dir="ltr">
                <span className="font-mono">{contactPhone}</span>
              </MawkibCardLabeledRow>
            )}
          </div>
          {address && (
            <MawkibCardLabeledRow icon={cardIcons.address} label="آدرس موکب" className="mt-2">
              <p className="whitespace-pre-wrap">{address}</p>
            </MawkibCardLabeledRow>
          )}
        </div>
      )}

      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-4 py-2.5">
          {amenities.map(({ key, label }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200/80"
            >
              <span className="text-[#4a6fa5]">{cardIcons.amenity}</span>
              {label}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

export function MawkibGuestBrowseFooter({
  onViewCapacity,
  onViewDetails,
}: {
  onViewCapacity: () => void;
  onViewDetails: () => void;
}) {
  return (
    <div className="flex gap-2 border-t border-slate-100 px-4 py-2.5">
      <button
        type="button"
        onClick={onViewCapacity}
        className="flex-1 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100"
      >
        مشاهده ظرفیت
      </button>
      <button
        type="button"
        onClick={onViewDetails}
        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        جزئیات موکب
      </button>
    </div>
  );
}

export function MawkibInfoCard({
  mawkib,
  selectable = false,
  selected = false,
  onSelect,
  footer,
  reservationBlocked = false,
  showOnlineReservationStatus = true,
}: {
  mawkib: Mawkib;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  footer?: ReactNode;
  reservationBlocked?: boolean;
  showOnlineReservationStatus?: boolean;
}) {
  const canSelect = Boolean(selectable && !reservationBlocked && onSelect);
  const baseClass = 'w-full overflow-hidden rounded-2xl border-2 text-right transition-all';
  const stateClass = canSelect
    ? selected
      ? 'border-[#4a6fa5] bg-gradient-to-b from-[#f0f4fa] to-white shadow-md shadow-[#c5d4e8]/40'
      : 'border-slate-200 bg-white hover:border-[#c5d4e8] hover:shadow-sm'
    : reservationBlocked
      ? 'cursor-not-allowed border-slate-200 bg-slate-50/80 opacity-90'
      : 'border-slate-200 bg-white';

  const body = (
    <>
      <MawkibInfoCardBody
        mawkib={mawkib}
        selectable={canSelect}
        selected={selected}
        showOnlineReservationStatus={showOnlineReservationStatus}
      />
      {footer}
    </>
  );

  if (canSelect) {
    return (
      <button type="button" onClick={onSelect} className={`${baseClass} ${stateClass}`}>
        {body}
      </button>
    );
  }

  return <article className={`${baseClass} ${stateClass}`}>{body}</article>;
}

export function MawkibCard({
  mawkib,
  selected,
  onSelect,
  reservationBlocked = false,
}: {
  mawkib: Mawkib;
  selected: boolean;
  onSelect: () => void;
  reservationBlocked?: boolean;
}) {
  return (
    <MawkibInfoCard
      mawkib={mawkib}
      selectable
      selected={selected}
      onSelect={onSelect}
      reservationBlocked={reservationBlocked}
    />
  );
}
