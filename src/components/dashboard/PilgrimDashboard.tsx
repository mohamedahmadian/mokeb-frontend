import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { formatPersianDateRange } from "../ui/PersianDateRangePicker";
import { NavIcon, type NavIconName } from "../ui/NavIcons";
import {
  IconCalendar,
  IconHome,
  IconUsers,
} from "../reservations/reservation-form-ui";
import { formatTimeFa } from "../../lib/format-time";
import { formatGuestCount } from "../../lib/capacity";
import { dashboardApi } from "../../lib/dashboard";
import { reservationsApi } from "../../lib/reservations";
import { RESERVATION_STATUS_LABELS } from "../../lib/constants";
import type { Reservation } from "../../types";
import {
  findCountdownReservation,
  findLatestActiveReservation,
  formatCountdownFa,
  getCountdownParts,
  getRecentReservations,
  getReservationCheckInAt,
} from "../../lib/pilgrim-dashboard";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 ring-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Cancelled: "bg-red-100 text-red-700 ring-red-200",
  Completed: "bg-slate-100 text-slate-700 ring-slate-200",
};

function IconClock() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function IconTracking() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
      />
    </svg>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className={`mb-3 h-1 w-10 rounded-full ${accent}`} />
      <p className="text-2xl font-bold text-slate-800">
        {value.toLocaleString("fa-IR")}
      </p>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">{label}</p>
    </div>
  );
}

function QuickAction({
  to,
  label,
  description,
  icon,
  iconBg,
  iconColor,
}: {
  to: string;
  label: string;
  description: string;
  icon: NavIconName;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-[#c5d4e8] hover:shadow-md"
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${iconBg} ${iconColor}`}
      >
        <NavIcon name={icon} className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <NavIcon
        name="chevron"
        className="h-4 w-4 shrink-0 -rotate-90 text-slate-300 transition group-hover:text-[#4a6fa5]"
        strokeWidth={2}
      />
    </Link>
  );
}

function InfoField({
  icon,
  label,
  value,
  valueClassName = "",
  compact = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueClassName?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#4a6fa5] ring-1 ring-slate-100">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-slate-500">{label}</p>
          <div
            className={`truncate text-xs font-semibold text-slate-800 ${valueClassName}`}
          >
            {value}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white p-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div
          className={`mt-1 text-sm font-semibold leading-relaxed text-slate-800 ${valueClassName}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Reservation["status"] }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusColors[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {RESERVATION_STATUS_LABELS[status]}
    </span>
  );
}

function CountdownBanner({ reservation }: { reservation: Reservation }) {
  const checkInAt = useMemo(
    () => getReservationCheckInAt(reservation),
    [reservation],
  );
  const [parts, setParts] = useState(() => getCountdownParts(checkInAt));

  useEffect(() => {
    const tick = () => setParts(getCountdownParts(checkInAt));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [checkInAt]);

  const checkInTime = formatTimeFa(
    reservation.plannedCheckInTime ?? reservation.mawkib.defaultCheckInTime,
  );

  return (
    <section className="overflow-hidden rounded-xl border border-[#c5d4e8] bg-gradient-to-l from-[#4a6fa5] to-[#3d5d8a] px-3.5 py-2.5 text-white shadow-sm sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
            <IconClock />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-white/75">شمارش معکوس تا ورود</p>
            <p className="text-base font-bold leading-tight sm:text-lg">
              {formatCountdownFa(parts)}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-white/85 sm:text-xs">
              {reservation.mawkib.name} — ورود {checkInTime}
            </p>
          </div>
        </div>
        <Link
          to={`/reservations/${reservation.id}`}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-medium text-white ring-1 ring-white/25 transition hover:bg-white/25"
        >
          جزئیات
        </Link>
      </div>
    </section>
  );
}

function ActiveReservationCard({ reservation }: { reservation: Reservation }) {
  const endDate = reservation.reservationEndDate ?? reservation.reservationDate;
  const checkInTime = formatTimeFa(
    reservation.plannedCheckInTime ?? reservation.mawkib.defaultCheckInTime,
  );

  return (
    <section className="overflow-hidden rounded-xl border border-[#c5d4e8]/60 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-3.5 py-2.5 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5] ring-1 ring-[#c5d4e8]">
              <IconHome />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#4a6fa5]">
                رزرو فعال
              </p>
              <h2 className="truncate text-sm font-bold text-slate-800 sm:text-base">
                {reservation.mawkib.name}
              </h2>
            </div>
          </div>
          <StatusBadge status={reservation.status} />
        </div>
      </div>

      <div className="space-y-2.5 p-3.5 sm:p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <InfoField
            compact
            icon={<IconCalendar />}
            label="بازه اقامت"
            value={formatPersianDateRange(
              reservation.reservationDate.slice(0, 10),
              endDate.slice(0, 10),
            )}
          />
          <InfoField
            compact
            icon={<IconUsers />}
            label="تعداد مهمان"
            value={formatGuestCount(
              reservation.maleGuestCount,
              reservation.femaleGuestCount,
            )}
          />
          <InfoField
            compact
            icon={<IconTracking />}
            label="کد پیگیری"
            value={reservation.trackingCode}
            valueClassName="font-mono tracking-wide"
          />
          <InfoField
            compact
            icon={<IconClock />}
            label="ورود برنامه‌ای"
            value={checkInTime}
          />
        </div>

        <div className="flex justify-end pt-0.5">
          <Link
            to={`/reservations/${reservation.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4a6fa5] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3d5d8a] sm:text-sm"
          >
            مشاهده جزئیات رزرو
            <NavIcon
              name="chevron"
              className="h-3.5 w-3.5 -rotate-90"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function RecentReservationRow({ reservation }: { reservation: Reservation }) {
  const endDate = reservation.reservationEndDate ?? reservation.reservationDate;

  return (
    <Link
      to={`/reservations/${reservation.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 transition hover:border-[#c5d4e8] hover:bg-white"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
          <IconHome />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {reservation.mawkib.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {formatPersianDateRange(
              reservation.reservationDate.slice(0, 10),
              endDate.slice(0, 10),
            )}
          </p>
        </div>
      </div>
      <StatusBadge status={reservation.status} />
    </Link>
  );
}

interface PilgrimDashboardProps {
  fullName: string;
}

export function PilgrimDashboard({ fullName }: PilgrimDashboardProps) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["reservations-my"],
    queryFn: () => reservationsApi.getMyList(),
  });

  const isLoading = statsLoading || reservationsLoading;

  const activeReservation = useMemo(
    () => findLatestActiveReservation(reservations),
    [reservations],
  );
  const countdownReservation = useMemo(
    () => findCountdownReservation(reservations),
    [reservations],
  );
  const recentReservations = useMemo(
    () => getRecentReservations(reservations, 3),
    [reservations],
  );

  const pilgrimStats = stats?.pilgrimStats;

  if (isLoading) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
          داشبورد
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          زائر عزیز،
          <span className="inline-block rounded-lg bg-[#e8eef6] px-3 py-1 text-[#4a6fa5] text-xs font-semibold">
            {fullName}
          </span>
          خوش اومدین !
        </p>
      </header>

      {countdownReservation && (
        <CountdownBanner reservation={countdownReservation} />
      )}

      {activeReservation ? (
        <ActiveReservationCard reservation={activeReservation} />
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f4fa] text-[#4a6fa5]">
            <NavIcon name="reserve" className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            رزرو فعالی ندارید
          </p>
          <p className="mt-1 text-xs text-slate-500">
            برای اقامت در موکب، یک رزرو جدید ثبت کنید.
          </p>
          <Link
            to="/reservations/new"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#4a6fa5] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3d5d8a]"
          >
            <NavIcon name="quickReserve" className="h-4 w-4" strokeWidth={2} />
            رزرو جدید
          </Link>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold text-slate-700 sm:mb-4">
          اقدامات سریع
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            to="/reservations/new"
            label="رزرو جدید"
            description="ثبت درخواست اقامت"
            icon="quickReserve"
            iconBg="bg-[#e8eef6]"
            iconColor="text-[#4a6fa5]"
          />
          <QuickAction
            to="/reservations"
            label="رزروهای من"
            description="مشاهده همه رزروها"
            icon="myRequests"
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
          />
          <QuickAction
            to="/mawkibs"
            label="مشاهده موکب‌ها"
            description="لیست موکب‌های فعال"
            icon="mawkibs"
            iconBg="bg-[#f3ebe0]"
            iconColor="text-[#8b6914]"
          />
          <QuickAction
            to="/feedback/new"
            label="ثبت پیشنهادات"
            description="انتقاد، پیشنهاد یا نظر درباره موکب"
            icon="feedback"
            iconBg="bg-violet-100"
            iconColor="text-violet-700"
          />
          <QuickAction
            to="/guest/honorary-volunteer/register"
            label="ثبت درخواست خدمت"
            description=" آمادگی برای خدمت در موکب"
            icon="honoraryRegister"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-700"
          />
          <QuickAction
            to="/settings/password"
            label="تغییر رمز عبور"
            description="به‌روزرسانی رمز ورود به حساب"
            icon="key"
            iconBg="bg-amber-100"
            iconColor="text-amber-800"
          />
        </div>
      </section>

      {pilgrimStats && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-slate-700 sm:mb-4">
            آمار رزروها
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatTile
              label="کل رزروها"
              value={pilgrimStats.totalReservations}
              accent="bg-slate-500"
            />
            <StatTile
              label="تایید شده"
              value={pilgrimStats.confirmedReservations}
              accent="bg-[#4a6fa5]"
            />
            <StatTile
              label="رد شده"
              value={pilgrimStats.cancelledReservations ?? 0}
              accent="bg-red-500"
            />
            <StatTile
              label="در انتظار تایید"
              value={pilgrimStats.pendingReservations}
              accent="bg-amber-500"
            />
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
          <h2 className="text-base font-semibold text-slate-700">
            تاریخچه رزروها
          </h2>
          {reservations.length > 3 && (
            <Link
              to="/reservations"
              className="text-xs font-medium text-[#4a6fa5] hover:text-[#3d5d8a]"
            >
              مشاهده همه
            </Link>
          )}
        </div>

        {recentReservations.length > 0 ? (
          <div className="space-y-2">
            {recentReservations.map((reservation) => (
              <RecentReservationRow
                key={reservation.id}
                reservation={reservation}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            هنوز رزروی ثبت نشده است.
          </p>
        )}
      </section>
    </div>
  );
}
