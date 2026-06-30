import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MawkibFeedbackDetailModal } from "../mawkib-feedback/MawkibFeedbackDetailModal";
import { MawkibCardPrintButton } from "../mawkibs/MawkibCardPrintButton";
import { MawkibFormModal } from "../mawkibs/MawkibFormModal";
import { MawkibCapacityViewModal } from "../mawkibs/MawkibCapacityViewModal";
import { MawkibCapacityPills } from "../mawkibs/MawkibInfoCard";
import { CancelReservationModal } from "../reservations/CancelReservationModal";
import { ReservationTrackLookup } from "./ReservationTrackLookup";
import { formatPersianDateRange } from "../ui/PersianDateRangePicker";
import { formatPersianDateFromIso } from "../ui/PersianDateInput";
import { NavIcon, type NavIconName } from "../ui/NavIcons";
import { mawkibCityLabel } from "../../lib/mawkib-locations";
import { useAuth } from "../../contexts/AuthContext";
import { formatGuestCount } from "../../lib/capacity";
import { mawkibToCardData } from "../../lib/mawkib-card";
import { getApiErrorMessage } from "../../lib/constants";
import { dashboardApi } from "../../lib/dashboard";
import { formatTimeFa } from "../../lib/format-time";
import {
  computeReservationStats,
  getPendingReservations,
  getRecentPilgrims,
} from "../../lib/mawkib-owner-dashboard";
import { mawkibFeedbackApi } from "../../lib/mawkib-feedback";
import {
  mawkibsApi,
  type UpdateMawkibPayload,
} from "../../lib/mawkibs";
import {
  reservationsApi,
  type ReservationStatus,
} from "../../lib/reservations";
import { usersApi } from "../../lib/users";
import { RESERVATION_STATUS_LABELS } from "../../lib/constants";
import { toast, toastApiError } from "../../lib/toast";
import { btnAction, btnDanger, btnPrimary } from "../../lib/styles";
import { truncateText } from "../../lib/text";
import type { AdminUser, Mawkib, MawkibFeedback, Reservation } from "../../types";

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

function StatusBadge({ status }: { status: Reservation["status"] }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusColors[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {RESERVATION_STATUS_LABELS[status]}
    </span>
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

function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
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
            <MetaInline
              label="اقامت"
              value={stayRange}
              className="shrink-0"
            />
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
            <MetaInline
              label="مهمان"
              value={guestCount}
              className="shrink-0"
            />
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

function PendingFeedbackRow({
  feedback,
  onOpen,
}: {
  feedback: MawkibFeedback;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-start gap-3 rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-right transition hover:border-violet-200 hover:bg-violet-50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm ring-1 ring-violet-100">
        <NavIcon name="feedback" className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-slate-800">
            {feedback.author.fullName}
          </p>
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            بدون پاسخ
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {feedback.mawkib.name}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {truncateText(feedback.content, 120)}
        </p>
      </div>
    </button>
  );
}

function PilgrimRow({ pilgrim }: { pilgrim: AdminUser }) {
  return (
    <Link
      to={`/reservations/new?pilgrimUserId=${pilgrim.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:border-[#c5d4e8] hover:bg-[#f0f4fa]/40"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
          <NavIcon name="pilgrims" className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800">
            {pilgrim.fullName}
          </p>
          <p className="mt-0.5 font-mono text-xs text-slate-500" dir="ltr">
            {pilgrim.mobileNumber}
          </p>
        </div>
      </div>
      <span className="shrink-0 text-[10px] font-medium text-[#4a6fa5]">
        رزرو جدید
      </span>
    </Link>
  );
}

function MawkibQuickCard({
  mawkib,
  onEdit,
  onViewCapacity,
}: {
  mawkib: Mawkib;
  onEdit: () => void;
  onViewCapacity: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">
            {mawkib.name}
          </p>
          {mawkib.mawkibCity && (
            <p className="mt-0.5 text-xs text-slate-500">
              {mawkibCityLabel(mawkib.mawkibCity)}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            mawkib.status === "Approved"
              ? "bg-emerald-100 text-emerald-700"
              : mawkib.status === "Pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {mawkib.status === "Approved"
            ? "فعال"
            : mawkib.status === "Pending"
              ? "در انتظار"
              : "رد شده"}
        </span>
      </div>

      <div className="mt-3">
        <MawkibCapacityPills mawkib={mawkib} />
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex flex-wrap gap-1.5">
          <Link
            to={`/reservations/new?mawkibId=${mawkib.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-[#4a6fa5] px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-[#3d5d8a]"
          >
            <NavIcon name="quickReserve" className="h-3.5 w-3.5" />
            رزرو جدید
          </Link>
          <Link
            to={`/reservations?mawkibId=${mawkib.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <NavIcon name="reservations" className="h-3.5 w-3.5" />
            رزروها
          </Link>
          <Link
            to={`/users/pilgrims?mawkibId=${mawkib.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <NavIcon name="pilgrims" className="h-3.5 w-3.5" />
            زائرین
          </Link>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onViewCapacity}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1.5 text-[10px] font-medium text-violet-700 transition hover:bg-violet-100 sm:px-2.5 sm:text-[11px]"
          >
            مشاهده ظرفیت
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-700 transition hover:bg-slate-50 sm:px-2.5 sm:text-[11px]"
          >
            <NavIcon name="mawkibs" className="h-3.5 w-3.5 shrink-0" />
            ویرایش موکب
          </button>
          <MawkibCardPrintButton
            data={mawkibToCardData(mawkib)}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-[#c5d4e8] bg-[#f0f4fa] px-2 py-1.5 text-[10px] font-medium text-[#4a6fa5] transition hover:bg-[#e8eef6] sm:px-2.5 sm:text-[11px]"
          />
        </div>
      </div>
    </div>
  );
}

interface MawkibOwnerDashboardProps {
  fullName: string;
}

export function MawkibOwnerDashboard({ fullName }: MawkibOwnerDashboardProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes("Admin") ?? false;

  const [viewingFeedback, setViewingFeedback] = useState<MawkibFeedback | null>(
    null,
  );
  const [editingMawkib, setEditingMawkib] = useState<Mawkib | null>(null);
  const [mawkibFormOpen, setMawkibFormOpen] = useState(false);
  const [capacityMawkib, setCapacityMawkib] = useState<Mawkib | null>(null);
  const [rejectingReservation, setRejectingReservation] =
    useState<Reservation | null>(null);
  const [actionReservationId, setActionReservationId] = useState<number | null>(
    null,
  );
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null,
  );

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardApi.getStats,
  });

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["reservations-my"],
    queryFn: () => reservationsApi.getMyList(),
  });

  const { data: pendingFeedbacks = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ["mawkib-feedback-inbox", { replyStatus: "pending" }],
    queryFn: () => mawkibFeedbackApi.listInbox({ replyStatus: "pending" }),
  });

  const { data: pilgrims = [], isLoading: pilgrimsLoading } = useQuery({
    queryKey: ["pilgrims-list", {}],
    queryFn: () => usersApi.getPilgrims(),
  });

  const { data: mawkibs = [], isLoading: mawkibsLoading } = useQuery({
    queryKey: ["mawkibs-my"],
    queryFn: () => mawkibsApi.getMyList(),
  });

  const invalidateReservationData = () => {
    queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

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

  const updateMawkib = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMawkibPayload }) =>
      mawkibsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mawkibs-my"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("موکب با موفقیت ویرایش شد");
    },
  });

  const handleMawkibFormSubmit = async (payload: UpdateMawkibPayload) => {
    if (!editingMawkib) return;
    try {
      await updateMawkib.mutateAsync({
        id: editingMawkib.id,
        payload,
      });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "خطا در ذخیره موکب"));
    }
  };

  const openMawkibEditor = (mawkib: Mawkib) => {
    setEditingMawkib(mawkib);
    setMawkibFormOpen(true);
    void mawkibsApi
      .getOne(mawkib.id)
      .then(setEditingMawkib)
      .catch(() => toast.error("بارگذاری جزئیات موکب ناموفق بود"));
  };

  const isLoading =
    statsLoading ||
    reservationsLoading ||
    feedbackLoading ||
    pilgrimsLoading ||
    mawkibsLoading;

  const pendingReservations = useMemo(
    () => getPendingReservations(reservations, 5),
    [reservations],
  );
  const recentFeedbacks = useMemo(
    () => pendingFeedbacks.slice(0, 5),
    [pendingFeedbacks],
  );
  const recentPilgrims = useMemo(
    () => getRecentPilgrims(pilgrims, 10),
    [pilgrims],
  );
  const reservationStats = useMemo(
    () => stats?.mawkibOwnerStats ?? computeReservationStats(reservations),
    [stats?.mawkibOwnerStats, reservations],
  );

  if (isLoading) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">داشبورد</h1>
        <p className="mt-1 text-sm text-slate-500">
          موکب‌دار گرامی،
          <span className="mx-1 inline-block rounded-lg bg-[#f3ebe0] px-3 py-1 text-xs font-semibold text-[#8b6914]">
            {fullName}
          </span>
          خوش آمدید!
        </p>
      </header>

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

      <ReservationTrackLookup />

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
        <SectionHeader title="اقدامات سریع" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            to="/reservations/new"
            label="رزرو جدید"
            description="ثبت رزرو برای زائر"
            icon="quickReserve"
            iconBg="bg-[#e8eef6]"
            iconColor="text-[#4a6fa5]"
          />
          <QuickAction
            to="/reservations?status=Pending"
            label="تایید رزروها"
            description="بررسی درخواست‌های در انتظار"
            icon="reservations"
            iconBg="bg-amber-100"
            iconColor="text-amber-700"
          />
          <QuickAction
            to="/mawkibs"
            label="مدیریت موکب‌ها"
            description="ویرایش اطلاعات و ظرفیت"
            icon="mawkibs"
            iconBg="bg-[#f3ebe0]"
            iconColor="text-[#8b6914]"
          />
          <QuickAction
            to="/users/pilgrims"
            label="لیست زائرین"
            description="مشاهده و ثبت زائر"
            icon="pilgrims"
            iconBg="bg-violet-100"
            iconColor="text-violet-700"
          />
          <QuickAction
            to="/feedback/inbox"
            label="صندوق پیشنهادات"
            description="پاسخ به انتقادات زائران"
            icon="feedback"
            iconBg="bg-rose-100"
            iconColor="text-rose-700"
          />
          <QuickAction
            to="/settings/password"
            label="تغییر رمز عبور"
            description="به‌روزرسانی رمز ورود"
            icon="key"
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
          />
        </div>
      </section>

      {recentFeedbacks.length > 0 && (
        <section>
          <SectionHeader
            title="انتقادات و پیشنهادات"
            subtitle="پیام‌هایی که هنوز پاسخ داده نشده‌اند"
            viewAllTo="/feedback/inbox"
          />
          <div className="space-y-2">
            {recentFeedbacks.map((feedback) => (
              <PendingFeedbackRow
                key={feedback.id}
                feedback={feedback}
                onOpen={() => setViewingFeedback(feedback)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader
          title="موکب‌های من"
          subtitle="دسترسی سریع به عملیات هر موکب"
          viewAllTo={mawkibs.length > 0 ? "/mawkibs" : undefined}
        />
        {mawkibs.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {mawkibs.map((mawkib) => (
              <MawkibQuickCard
                key={mawkib.id}
                mawkib={mawkib}
                onEdit={() => openMawkibEditor(mawkib)}
                onViewCapacity={() => setCapacityMawkib(mawkib)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<NavIcon name="mawkibs" className="h-5 w-5" />}
            message="هنوز موکبی ثبت نکرده‌اید."
          />
        )}
      </section>

      <section>
        <SectionHeader title="آمار رزروها" />
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

      <section>
        <SectionHeader
          title="زائرین"
          subtitle="۱۰ زائر اخیر — برای رزرو سریع کلیک کنید"
          viewAllTo={pilgrims.length > 0 ? "/users/pilgrims" : undefined}
        />
        {recentPilgrims.length > 0 ? (
          <div className="space-y-2">
            {recentPilgrims.map((pilgrim) => (
              <PilgrimRow key={pilgrim.id} pilgrim={pilgrim} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<NavIcon name="pilgrims" className="h-5 w-5" />}
            message="هنوز زائری در سامانه ثبت نشده است."
          />
        )}
      </section>

      <MawkibFeedbackDetailModal
        open={!!viewingFeedback}
        feedback={viewingFeedback}
        onClose={() => setViewingFeedback(null)}
        mode="owner"
        invalidateQueryKeys={[
          "mawkib-feedback-inbox",
          "dashboard-stats",
          "reservations-my",
        ]}
      />

      <MawkibFormModal
        key={editingMawkib?.id ?? "new"}
        open={mawkibFormOpen}
        onClose={() => {
          setMawkibFormOpen(false);
          setEditingMawkib(null);
        }}
        onSubmit={handleMawkibFormSubmit}
        mawkib={editingMawkib}
        isAdmin={isAdmin}
        currentUserId={user?.id}
      />

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

      <MawkibCapacityViewModal
        open={!!capacityMawkib}
        onClose={() => setCapacityMawkib(null)}
        mawkibId={capacityMawkib?.id ?? 0}
        mawkibName={capacityMawkib?.name ?? ""}
        authenticated
      />
    </div>
  );
}
