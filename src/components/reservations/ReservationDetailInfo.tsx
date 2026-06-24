import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatPersianDate } from "../ui/PersianDateInput";
import { formatPersianDateRange } from "../ui/PersianDateRangePicker";
import { formatGuestCount } from "../../lib/capacity";
import { RESERVATION_STATUS_LABELS } from "../../lib/constants";
import type { Reservation } from "../../types";

const statusStyles: Record<
  Reservation["status"],
  { badge: string; banner: string; iconWrap: string }
> = {
  Pending: {
    badge: "bg-amber-100 text-amber-800 ring-amber-200",
    banner: "from-amber-50 to-white",
    iconWrap: "bg-amber-100 text-amber-700",
  },
  Confirmed: {
    badge: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    banner: "from-emerald-50 to-white",
    iconWrap: "bg-emerald-100 text-emerald-700",
  },
  Cancelled: {
    badge: "bg-red-100 text-red-800 ring-red-200",
    banner: "from-red-50 to-white",
    iconWrap: "bg-red-100 text-red-700",
  },
  Completed: {
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    banner: "from-slate-50 to-white",
    iconWrap: "bg-slate-100 text-slate-600",
  },
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="h-5 w-5"
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

const icons = {
  status: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </Icon>
  ),
  mawkib: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </Icon>
  ),
  pilgrim: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </Icon>
  ),
  phone: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </Icon>
  ),
  guests: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </Icon>
  ),
  calendar: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </Icon>
  ),
  registered: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </Icon>
  ),
  reservedBy: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </Icon>
  ),
  companions: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </Icon>
  ),
  note: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </Icon>
  ),
  cancel: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </Icon>
  ),
};

function InfoTile({
  icon,
  label,
  value,
  className = "",
  valueClassName = "",
  stacked = false,
  iconClassName = "",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
  stacked?: boolean;
  iconClassName?: string;
}) {
  const iconWrapClass =
    iconClassName ||
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100";

  if (stacked) {
    return (
      <div
        className={`rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3.5 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className={iconWrapClass}>{icon}</div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </div>
        <div className={`mt-2.5 text-sm text-slate-800 ${valueClassName}`}>
          {value}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3.5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className={iconWrapClass}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <div
            className={`mt-1 text-sm font-semibold text-slate-800 ${valueClassName}`}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReservationDetailInfoProps {
  reservation: Reservation;
  actions?: ReactNode;
  mawkibDetailsHref?: string;
  variant?: "guest" | "default";
  showStatusBanner?: boolean;
}

export function ReservationStatusBanner({
  reservation,
}: {
  reservation: Reservation;
}) {
  const styles = statusStyles[reservation.status];

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`}
    >
      <div
        className={`flex items-center justify-between gap-3 bg-gradient-to-l px-4 py-4 sm:px-5 ${styles.banner}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.iconWrap}`}
          >
            {icons.status}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">وضعیت رزرو</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {RESERVATION_STATUS_LABELS[reservation.status]}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles.badge}`}
        >
          {RESERVATION_STATUS_LABELS[reservation.status]}
        </span>
      </div>
    </div>
  );
}

export function ReservationDetailInfo({
  reservation,
  actions,
  mawkibDetailsHref,
  variant = "default",
  showStatusBanner = true,
}: ReservationDetailInfoProps) {
  const endDate = reservation.reservationEndDate ?? reservation.reservationDate;
  const isGuest = variant === "guest";
  const guestIconClass =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {showStatusBanner && <ReservationStatusBanner reservation={reservation} />}

      <div className={`space-y-3 p-4 sm:p-5 ${showStatusBanner ? "" : ""}`}>
        {mawkibDetailsHref ? (
          <Link
            to={mawkibDetailsHref}
            className={`block cursor-pointer rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3.5 transition hover:shadow-sm ${
              isGuest
                ? "hover:border-[#c5d4e8] hover:bg-[#f0f4fa]/50"
                : "hover:border-emerald-200 hover:bg-emerald-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 ${
                  isGuest ? "text-[#4a6fa5]" : "text-emerald-600"
                }`}
              >
                {icons.mawkib}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">موکب</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {reservation.mawkib.name}
                </p>
                {reservation.mawkib.address && (
                  <p className="mt-1 line-clamp-2 text-xs font-normal text-slate-500">
                    {reservation.mawkib.address}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
                  isGuest
                    ? "bg-[#e8eef6] text-[#4a6fa5] ring-[#c5d4e8]"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-100"
                }`}
              >
                نمایش جزئیات
              </span>
            </div>
          </Link>
        ) : (
          <InfoTile
            icon={icons.mawkib}
            label="موکب"
            value={
              <div>
                <p>{reservation.mawkib.name}</p>
                {reservation.mawkib.address && (
                  <p className="mt-1 text-xs font-normal text-slate-500">
                    {reservation.mawkib.address}
                  </p>
                )}
              </div>
            }
          />
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTile
            icon={icons.pilgrim}
            label="زائر"
            value={reservation.pilgrim.fullName}
          />
          <InfoTile
            icon={icons.phone}
            label="موبایل"
            value={
              <span className="font-mono tracking-wide">
                {reservation.pilgrimMobile}
              </span>
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTile
            icon={icons.guests}
            label="تعداد نفرات"
            value={formatGuestCount(
              reservation.maleGuestCount,
              reservation.femaleGuestCount,
            )}
          />
          <InfoTile
            icon={icons.calendar}
            label="بازه تاریخ اقامت"
            value={formatPersianDateRange(
              reservation.reservationDate.slice(0, 10),
              endDate.slice(0, 10),
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {reservation.createdAt && (
            <InfoTile
              icon={icons.registered}
              label="تاریخ ثبت"
              value={formatPersianDate(reservation.createdAt.slice(0, 10))}
            />
          )}
          <InfoTile
            icon={icons.reservedBy}
            label="ثبت‌کننده"
            value={reservation.reservedBy.fullName}
            className={!reservation.createdAt ? "sm:col-span-2" : ""}
          />
        </div>

        {reservation.companions && (
          <InfoTile
            icon={icons.companions}
            label="همراهان"
            stacked
            iconClassName={isGuest ? guestIconClass : undefined}
            value={
              <p className="whitespace-pre-wrap font-normal leading-relaxed text-slate-700">
                {reservation.companions}
              </p>
            }
            valueClassName="font-normal"
          />
        )}

        <InfoTile
          icon={icons.note}
          label="توضیحات"
          stacked
          iconClassName={isGuest ? guestIconClass : undefined}
          value={
            reservation.description?.trim() ? (
              <p className="whitespace-pre-wrap font-normal leading-relaxed text-slate-700">
                {reservation.description}
              </p>
            ) : (
              <span className="font-normal text-slate-400">—</span>
            )
          }
          valueClassName="font-normal"
        />

        {reservation.cancellationNote && (
          <InfoTile
            icon={icons.cancel}
            label="دلیل لغو"
            stacked
            iconClassName={isGuest ? guestIconClass : undefined}
            value={
              <p className="whitespace-pre-wrap font-normal leading-relaxed text-red-700">
                {reservation.cancellationNote}
              </p>
            }
            valueClassName="font-normal"
          />
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5">
          {actions}
        </div>
      )}
    </div>
  );
}
