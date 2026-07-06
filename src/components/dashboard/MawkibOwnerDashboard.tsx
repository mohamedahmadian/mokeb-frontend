import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MawkibFeedbackDetailModal } from "../mawkib-feedback/MawkibFeedbackDetailModal";
import { MawkibCardPrintButton } from "../mawkibs/MawkibCardPrintButton";
import { MawkibRulesPrintButton } from "../mawkibs/MawkibRulesPrintButton";
import { MawkibCapacityViewModal } from "../mawkibs/MawkibCapacityViewModal";
import { MawkibCapacityMiniDonuts } from "../mawkibs/MawkibCapacityMiniDonut";
import { MawkibCapacityPills } from "../mawkibs/MawkibInfoCard";
import { MawkibThumbnail } from "../mawkibs/MawkibThumbnail";
import { CancelReservationModal } from "../reservations/CancelReservationModal";
import { PendingReservationCard } from "../reservations/PendingReservationCard";
import { ReservationTrackLookup } from "./ReservationTrackLookup";
import { NavIcon, type NavIconName } from "../ui/NavIcons";
import { mawkibCityLabel } from "../../lib/mawkib-locations";
import { mawkibToCardData } from "../../lib/mawkib-card";
import { mawkibToRulesPrintData } from "../../lib/mawkib-rules-print";
import { getApiErrorMessage } from "../../lib/constants";
import { dashboardApi } from "../../lib/dashboard";
import {
  computeReservationStats,
  getPendingReservations,
} from "../../lib/mawkib-owner-dashboard";
import { mawkibFeedbackApi } from "../../lib/mawkib-feedback";
import { mawkibsApi } from "../../lib/mawkibs";
import {
  reservationsApi,
  type ReservationStatus,
} from "../../lib/reservations";
import { toast, toastApiError } from "../../lib/toast";
import { truncateText } from "../../lib/text";
import type {
  Mawkib,
  MawkibFeedback,
  Reservation,
} from "../../types";

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
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
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

function MawkibQuickCard({
  mawkib,
  onViewCapacity,
  presentMale,
  presentFemale,
}: {
  mawkib: Mawkib;
  onViewCapacity: () => void;
  presentMale: number;
  presentFemale: number;
}) {
  const quickBtn =
    "inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition sm:px-2.5 sm:text-[11px]";

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <div
        className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3"
        dir="ltr"
      >
        <MawkibCapacityMiniDonuts mawkib={mawkib} size={100} />

        <div className="flex min-w-0 flex-col items-end gap-2">
          <div className="flex max-w-full items-start gap-2.5">
            <div className="min-w-0 text-right" dir="rtl">
              <p className="truncate text-sm font-semibold text-slate-800">
                {mawkib.name}
              </p>
              {mawkib.mawkibCity && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {mawkibCityLabel(mawkib.mawkibCity)}
                </p>
              )}
            </div>
            <div className="relative shrink-0">
              <div
                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#c5d4e8]/70 to-[#e8eef6]/30 blur-[2px]"
                aria-hidden
              />
              <MawkibThumbnail
                imageUrl={mawkib.imageUrl}
                name={mawkib.name}
                className="relative h-16 w-16 rounded-xl shadow-lg shadow-slate-300/60 ring-2 ring-white"
              />
            </div>
          </div>

          <MawkibCapacityPills
            mawkib={mawkib}
            compact
            fitContent
            presentMale={presentMale}
            presentFemale={presentFemale}
          />
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <Link
            to={`/reservations/new?mawkibId=${mawkib.id}`}
            className={`${quickBtn} bg-[#4a6fa5] text-white hover:bg-[#3d5d8a]`}
          >
            <NavIcon name="quickReserve" className="h-3.5 w-3.5 shrink-0" />
            رزرو جدید
          </Link>
          <Link
            to={`/reservations?mawkibId=${mawkib.id}`}
            className={`${quickBtn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
          >
            <NavIcon name="reservations" className="h-3.5 w-3.5 shrink-0" />
            تاریخچه رزروها
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <Link
            to={`/reservations/quick?mawkibId=${mawkib.id}`}
            className={`${quickBtn} border border-[#4a6fa5]/30 bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6]`}
          >
            <NavIcon name="todayReserve" className="h-3.5 w-3.5 shrink-0" />
            رزرو سریع
          </Link>
          <button
            type="button"
            onClick={onViewCapacity}
            className={`${quickBtn} border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100`}
          >
            تقویم ظرفیت
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <MawkibCardPrintButton
            data={mawkibToCardData(mawkib)}
            className={`${quickBtn} border border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6]`}
          />
          <MawkibRulesPrintButton
            data={mawkibToRulesPrintData(mawkib)}
            className={`${quickBtn} border border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6]`}
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

  const [viewingFeedback, setViewingFeedback] = useState<MawkibFeedback | null>(
    null,
  );
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

  const { data: mawkibs = [], isLoading: mawkibsLoading } = useQuery({
    queryKey: ["mawkibs-my"],
    queryFn: () => mawkibsApi.getMyList(),
  });

  const invalidateReservationData = () => {
    queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["mawkibs-my"] });
    queryClient.invalidateQueries({
      queryKey: ["reservations-pending-counts"],
    });
    queryClient.invalidateQueries({ queryKey: ["waiting-list-mawkibs"] });
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

  const isLoading =
    statsLoading ||
    reservationsLoading ||
    feedbackLoading ||
    mawkibsLoading;

  const pendingReservations = useMemo(
    () => getPendingReservations(reservations, 3),
    [reservations],
  );
  const recentFeedbacks = useMemo(
    () => pendingFeedbacks.slice(0, 5),
    [pendingFeedbacks],
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
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
          داشبورد
        </h1>
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
              to="/reservations/waiting-list"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-amber-700"
            >
              مشاهده همه
            </Link>
          </div>
        </section>
      )}

      <ReservationTrackLookup
        onAttendanceSuccess={() => {
          invalidateReservationData();
        }}
      />

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
                onViewCapacity={() => setCapacityMawkib(mawkib)}
                presentMale={mawkib.presentMaleCount ?? 0}
                presentFemale={mawkib.presentFemaleCount ?? 0}
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
        {pendingReservations.length > 0 ? (
          <>
            <SectionHeader
              title="رزروهای در انتظار تایید"
              subtitle="درخواست‌های ثبت‌شده که هنوز تایید نشده‌اند"
              viewAllTo="/reservations/waiting-list"
            />
            <div className="space-y-2.5">
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
            <div className="mt-4 flex justify-center">
              <Link
                to="/reservations/waiting-list"
                className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 transition hover:bg-amber-50"
              >
                مشاهده لیست کامل انتظار
              </Link>
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
        serviceStartDate={capacityMawkib?.serviceStartDate}
        serviceEndDate={capacityMawkib?.serviceEndDate}
        authenticated
      />
    </div>
  );
}
