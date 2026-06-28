import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CancelReservationModal } from "../reservations/CancelReservationModal";
import { ReservationTrackLookup } from "./ReservationTrackLookup";
import { formatPersianDateRange } from "../ui/PersianDateRangePicker";
import { formatPersianDateFromIso } from "../ui/PersianDateInput";
import { NavIcon } from "../ui/NavIcons";
import { IconPhone } from "../mawkibs/mawkib-form-ui";
import { MapPinIcon } from "../users/user-form-ui";
import { mawkibCityLabel } from "../../lib/mawkib-locations";
import { formatGuestCount } from "../../lib/capacity";
import { getApiErrorMessage } from "../../lib/constants";
import { formatTimeFa } from "../../lib/format-time";
import {
  computeReservationStats,
  getPendingMawkibs,
  getPendingReservations,
  lookupAdminReservation,
} from "../../lib/admin-dashboard";
import { mawkibsApi } from "../../lib/mawkibs";
import {
  reservationsApi,
  type ReservationStatus,
} from "../../lib/reservations";
import { RESERVATION_STATUS_LABELS } from "../../lib/constants";
import { toast, toastApiError } from "../../lib/toast";
import { btnAction, btnDanger, btnPrimary } from "../../lib/styles";
import type { Mawkib, Reservation } from "../../types";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 ring-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Cancelled: "bg-red-100 text-red-700 ring-red-200",
  Completed: "bg-slate-100 text-slate-700 ring-slate-200",
};

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

function SectionHeader({
  title,
  subtitle,
  viewAllTo,
  viewAllLabel = "مشاهده همه",
}: {
  title: string;
  subtitle?: string;
  viewAllTo?: string;
  viewAllLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
      <div>
        <h2 className="text-base font-semibold text-slate-700">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="shrink-0 pt-0.5 text-xs font-medium text-[#4a6fa5] hover:text-[#3d5d8a]"
        >
          {viewAllLabel}
        </Link>
      )}
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

function MetaInline({
  label,
  value,
  dir,
  className = "",
}: {
  label: string;
  value: ReactNode;
  dir?: "ltr" | "rtl";
  className?: string;
}) {
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className="text-[10px] text-slate-500">{label}</span>
      <span
        className={`text-[11px] font-semibold text-slate-800 ${dir === "ltr" ? "font-mono" : ""}`}
        dir={dir}
      >
        {value}
      </span>
    </span>
  );
}

function MetaDivider() {
  return (
    <span className="hidden text-slate-300 sm:inline" aria-hidden>
      ·
    </span>
  );
}

function MetaChip({
  icon,
  value,
  dir,
}: {
  icon: ReactNode;
  value: ReactNode;
  dir?: "ltr" | "rtl";
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 text-[11px] text-slate-600">
      <span className="shrink-0 text-[#4a6fa5]">{icon}</span>
      <span
        className={`truncate font-medium text-slate-800 ${dir === "ltr" ? "font-mono" : ""}`}
        dir={dir}
      >
        {value}
      </span>
    </span>
  );
}

function PendingMawkibCard({
  mawkib,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  mawkib: Mawkib;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const capacity = formatGuestCount(mawkib.maleCapacity, mawkib.femaleCapacity);
  const isBusy = isApproving || isRejecting;
  const iconClass = "h-3.5 w-3.5";

  return (
    <div className="overflow-hidden rounded-lg border border-amber-200/70 bg-gradient-to-l from-amber-50/50 to-white">
      <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-200/60">
          <NavIcon name="mawkibs" className="h-4 w-4" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1 sm:pe-2 sm:border-e sm:border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-baseline gap-1.5">
                <span className="truncate text-sm font-bold text-slate-800">
                  {mawkib.name}
                </span>
                {mawkib.owner && (
                  <>
                    <span className="shrink-0 text-slate-300" aria-hidden>
                      ·
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1 truncate text-[11px] text-slate-500">
                      <NavIcon
                        name="mawkibOwners"
                        className="h-3 w-3 shrink-0 text-slate-400"
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{mawkib.owner.fullName}</span>
                    </span>
                  </>
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                {mawkib.mawkibCity && (
                  <MetaChip
                    icon={<MapPinIcon className={iconClass} />}
                    value={mawkibCityLabel(mawkib.mawkibCity)}
                  />
                )}
                <MetaChip
                  icon={
                    <NavIcon name="users" className={iconClass} strokeWidth={1.75} />
                  }
                  value={capacity}
                />
                <MetaChip
                  icon={<IconPhone />}
                  value={mawkib.phoneNumber}
                  dir="ltr"
                />
                {mawkib.owner?.mobileNumber && (
                  <MetaChip
                    icon={
                      <NavIcon
                        name="pilgrims"
                        className={iconClass}
                        strokeWidth={1.75}
                      />
                    }
                    value={mawkib.owner.mobileNumber}
                    dir="ltr"
                  />
                )}
              </div>
            </div>
            <span className="hidden shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 ring-1 ring-amber-200 sm:inline-flex">
              در انتظار
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-row gap-1 sm:w-[7rem] sm:flex-col sm:gap-1">
          <button
            type="button"
            onClick={onApprove}
            disabled={isBusy}
            className={`${btnPrimary} flex-1 !min-h-8 !px-2 !py-1.5 !text-[11px] sm:w-full`}
          >
            {isApproving ? "..." : "تایید"}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isBusy}
            className={`${btnDanger} flex-1 !min-h-8 !px-2 !py-1.5 !text-[11px] sm:w-full`}
          >
            {isRejecting ? "..." : "رد"}
          </button>
          <Link
            to={`/mawkibs?editId=${mawkib.id}`}
            className={`${btnAction} inline-flex flex-1 items-center justify-center gap-1 border border-slate-200 bg-white !min-h-8 !px-2 !py-1.5 !text-[11px] text-slate-700 hover:bg-slate-50 sm:w-full`}
          >
            <NavIcon name="info" className="h-3.5 w-3.5" strokeWidth={1.75} />
            جزئیات
          </Link>
        </div>
      </div>
    </div>
  );
}

function PendingReservationCard({
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
  const checkInTime = formatTimeFa(
    reservation.plannedCheckInTime ?? reservation.mawkib.defaultCheckInTime,
  );
  const checkOutTime = formatTimeFa(
    reservation.plannedCheckOutTime ?? reservation.mawkib.defaultCheckOutTime,
  );
  const createdAtLabel = reservation.createdAt
    ? formatPersianDateFromIso(reservation.createdAt)
    : "—";
  const isBusy = isApproving || isRejecting;
  const stayRange = formatPersianDateRange(
    reservation.reservationDate.slice(0, 10),
    endDate.slice(0, 10),
  );
  const guestCount = formatGuestCount(
    reservation.maleGuestCount,
    reservation.femaleGuestCount,
  );

  return (
    <div className="overflow-hidden rounded-lg border border-amber-200/70 bg-amber-50/40">
      <div className="flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center sm:gap-3 sm:p-3">
        <div className="min-w-0 flex-1 sm:pe-3 sm:border-e sm:border-slate-200/80">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              <span className="truncate text-sm font-bold text-slate-800">
                {reservation.pilgrim.fullName}
              </span>
              <span className="text-slate-300" aria-hidden>
                ·
              </span>
              <span className="truncate text-[11px] text-slate-500">
                {reservation.mawkib.name}
              </span>
            </div>
            <StatusBadge status={reservation.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <MetaInline label="اقامت" value={stayRange} className="shrink-0" />
            <MetaDivider />
            <MetaInline
              label="ورود"
              value={checkInTime}
              dir="ltr"
              className="shrink-0"
            />
            <MetaInline
              label="خروج"
              value={checkOutTime}
              dir="ltr"
              className="shrink-0"
            />
            <MetaDivider />
            <MetaInline label="مهمان" value={guestCount} className="shrink-0" />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <MetaInline
              label="موبایل"
              value={reservation.pilgrim.mobileNumber}
              dir="ltr"
            />
            <MetaDivider />
            <MetaInline
              label="پیگیری"
              value={reservation.trackingCode}
              dir="ltr"
            />
            <MetaDivider />
            <MetaInline label="ثبت" value={createdAtLabel} />
          </div>

          {reservation.description?.trim() && (
            <p className="mt-1 line-clamp-1 text-[11px] text-slate-600">
              <span className="text-slate-400">توضیح: </span>
              {reservation.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-row gap-1.5 sm:w-[7rem] sm:flex-col sm:gap-1">
          <button
            type="button"
            onClick={onApprove}
            disabled={isBusy}
            className={`${btnPrimary} flex-1 !min-h-8 !px-2 !py-1.5 !text-[11px] sm:w-full`}
          >
            {isApproving ? "..." : "تایید"}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={isBusy}
            className={`${btnDanger} flex-1 !min-h-8 !px-2 !py-1.5 !text-[11px] sm:w-full`}
          >
            {isRejecting ? "..." : "رد"}
          </button>
          <Link
            to={`/reservations/${reservation.id}`}
            className={`${btnAction} flex-1 border border-slate-200 bg-white !min-h-8 !px-2 !py-1.5 !text-[11px] text-slate-700 hover:bg-slate-50 sm:w-full`}
          >
            جزئیات
          </Link>
        </div>
      </div>
    </div>
  );
}

interface AdminDashboardProps {
  fullName: string;
}

export function AdminDashboard({ fullName }: AdminDashboardProps) {
  const queryClient = useQueryClient();

  const [rejectingReservation, setRejectingReservation] =
    useState<Reservation | null>(null);
  const [actionReservationId, setActionReservationId] = useState<number | null>(
    null,
  );
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );
  const [actionMawkibId, setActionMawkibId] = useState<number | null>(null);
  const [mawkibActionType, setMawkibActionType] = useState<
    "approve" | "reject" | null
  >(null);

  const { data: pendingMawkibsList = [], isLoading: mawkibsLoading } = useQuery({
    queryKey: ["mawkibs-admin", { status: "Pending" }],
    queryFn: () => mawkibsApi.getAdminList({ status: "Pending" }),
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["reservations-admin"],
    queryFn: () => reservationsApi.getAdminList(),
  });

  const invalidateMawkibData = () => {
    queryClient.invalidateQueries({ queryKey: ["mawkibs-admin"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const invalidateReservationData = () => {
    queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const approveMawkib = useMutation({
    mutationFn: (id: number) => mawkibsApi.update(id, { status: "Approved" }),
    onMutate: (id) => {
      setActionMawkibId(id);
      setMawkibActionType("approve");
    },
    onSuccess: () => {
      invalidateMawkibData();
      toast.success("موکب با موفقیت تایید شد");
    },
    onError: (error) => {
      toastApiError(error, "خطا در تایید موکب");
    },
    onSettled: () => {
      setActionMawkibId(null);
      setMawkibActionType(null);
    },
  });

  const rejectMawkib = useMutation({
    mutationFn: (id: number) => mawkibsApi.update(id, { status: "Rejected" }),
    onMutate: (id) => {
      setActionMawkibId(id);
      setMawkibActionType("reject");
    },
    onSuccess: () => {
      invalidateMawkibData();
      toast.success("موکب رد شد");
    },
    onError: (error) => {
      toastApiError(error, "خطا در رد موکب");
    },
    onSettled: () => {
      setActionMawkibId(null);
      setMawkibActionType(null);
    },
  });

  const approveReservation = useMutation({
    mutationFn: (id: number) =>
      reservationsApi.updateStatus(id, "Confirmed" as ReservationStatus),
    onMutate: (id) => {
      setActionReservationId(id);
      setActionType("approve");
    },
    onSuccess: () => {
      invalidateReservationData();
      toast.success("رزرو با موفقیت تایید شد");
    },
    onError: (error) => {
      toastApiError(error, "خطا در تایید رزرو");
    },
    onSettled: () => {
      setActionReservationId(null);
      setActionType(null);
    },
  });

  const rejectReservation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      reservationsApi.cancel(id, note),
    onMutate: ({ id }) => {
      setActionReservationId(id);
      setActionType("reject");
    },
    onSuccess: () => {
      invalidateReservationData();
      setRejectingReservation(null);
      toast.success("درخواست رزرو رد شد");
    },
    onError: (error) => {
      toastApiError(error, "خطا در رد درخواست");
    },
    onSettled: () => {
      setActionReservationId(null);
      setActionType(null);
    },
  });

  const pendingMawkibs = useMemo(
    () => getPendingMawkibs(pendingMawkibsList, 5),
    [pendingMawkibsList],
  );
  const pendingReservations = useMemo(
    () => getPendingReservations(reservations, 5),
    [reservations],
  );
  const reservationStats = useMemo(
    () => computeReservationStats(reservations),
    [reservations],
  );

  const isLoading = mawkibsLoading || reservationsLoading;

  if (isLoading) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">داشبورد</h1>
        <p className="mt-1 text-sm text-slate-500">
          مدیر گرامی،
          <span className="mx-1 inline-block rounded-lg bg-[#e8eef6] px-3 py-1 text-xs font-semibold text-[#3d5d8a]">
            {fullName}
          </span>
          خوش آمدید!
        </p>
      </header>

      {pendingMawkibsList.length > 0 && (
        <section className="overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-l from-amber-50 to-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <NavIcon name="mawkibs" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {pendingMawkibsList.length.toLocaleString("fa-IR")} موکب در
                  انتظار تایید
                </p>
                <p className="text-xs text-amber-700">
                  لطفاً موکب‌های ثبت‌شده را بررسی و تایید کنید.
                </p>
              </div>
            </div>
            <Link
              to="/mawkibs?status=Pending"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-700"
            >
              مشاهده همه
            </Link>
          </div>
        </section>
      )}

      <section>
        {pendingMawkibs.length > 0 ? (
          <>
            <SectionHeader
              title="موکب‌های در انتظار تایید"
              subtitle="موکب‌های ثبت‌شده که هنوز توسط مدیریت تایید نشده‌اند"
              viewAllTo="/mawkibs?status=Pending"
            />
            <div className="space-y-2">
              {pendingMawkibs.map((mawkib) => (
                <PendingMawkibCard
                  key={mawkib.id}
                  mawkib={mawkib}
                  onApprove={() => approveMawkib.mutate(mawkib.id)}
                  onReject={() => rejectMawkib.mutate(mawkib.id)}
                  isApproving={
                    actionMawkibId === mawkib.id &&
                    mawkibActionType === "approve"
                  }
                  isRejecting={
                    actionMawkibId === mawkib.id &&
                    mawkibActionType === "reject"
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs text-slate-500">
            <NavIcon
              name="mawkibs"
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
            />
            <span>
              موکب در انتظار تایید:{" "}
              <span className="font-medium text-slate-600">موردی نیست</span>
            </span>
          </div>
        )}
      </section>

      <ReservationTrackLookup
        lookupFn={lookupAdminReservation}
        showCheckIn={false}
      />

      {reservationStats.pendingReservations > 0 && (
        <section className="overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-l from-amber-50 to-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <NavIcon name="reservations" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  {reservationStats.pendingReservations.toLocaleString("fa-IR")}{" "}
                  رزرو در انتظار تایید
                </p>
                <p className="text-xs text-amber-700">
                  لطفاً درخواست‌های جدید را بررسی و تایید کنید.
                </p>
              </div>
            </div>
            <Link
              to="/reservations?status=Pending"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-700"
            >
              مشاهده همه
            </Link>
          </div>
        </section>
      )}

      <section>
        {pendingReservations.length > 0 ? (
          <>
            <SectionHeader
              title="رزروهای در انتظار تایید"
              subtitle="درخواست‌های ثبت‌شده که هنوز تایید نشده‌اند"
              viewAllTo="/reservations?status=Pending"
            />
            <div className="space-y-2">
              {pendingReservations.map((reservation) => (
                <PendingReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onApprove={() => approveReservation.mutate(reservation.id)}
                  onReject={() => setRejectingReservation(reservation)}
                  isApproving={
                    actionReservationId === reservation.id &&
                    actionType === "approve"
                  }
                  isRejecting={
                    actionReservationId === reservation.id &&
                    actionType === "reject"
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2 text-xs text-slate-500">
            <NavIcon
              name="reservations"
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
            />
            <span>
              رزرو در انتظار تایید:{" "}
              <span className="font-medium text-slate-600">موردی نیست</span>
            </span>
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="آمار رزروها" subtitle="آمار کل رزروهای سامانه" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          <StatTile
            label="کل رزروها"
            value={reservationStats.totalReservations}
            accent="bg-slate-500"
          />
          <StatTile
            label="در انتظار تایید"
            value={reservationStats.pendingReservations}
            accent="bg-amber-500"
          />
          <StatTile
            label="تایید شده"
            value={reservationStats.confirmedReservations}
            accent="bg-[#4a6fa5]"
          />
          <StatTile
            label="لغو شده"
            value={reservationStats.cancelledReservations}
            accent="bg-red-500"
          />
          <StatTile
            label="تکمیل شده"
            value={reservationStats.completedReservations}
            accent="bg-emerald-500"
          />
        </div>
      </section>

      <CancelReservationModal
        open={!!rejectingReservation}
        onClose={() => setRejectingReservation(null)}
        onSubmit={async (note) => {
          if (!rejectingReservation) return;
          try {
            await rejectReservation.mutateAsync({
              id: rejectingReservation.id,
              note: note || undefined,
            });
          } catch (error) {
            throw new Error(getApiErrorMessage(error, "خطا در رد درخواست"));
          }
        }}
        title="رد درخواست رزرو"
        description="در صورت تمایل دلیل رد درخواست را بنویسید تا برای زائر نمایش داده شود."
        noteLabel="دلیل رد (اختیاری)"
        submitLabel="رد درخواست"
      />
    </div>
  );
}
