import { ConfirmDialog } from "../ConfirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type FormEvent, type ReactNode, type RefObject } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPersianDateRange } from "../ui/PersianDateRangePicker";
import { NavIcon } from "../ui/NavIcons";
import { ReservationDeliveredItemsButton } from "../reservations/ReservationDeliveredItemsButton";
import { PilgrimCardViewButton } from "../reservations/PilgrimCardViewButton";
import { ReservationMealPlanLink } from "../reservations/ReservationMealPlanLink";
import { ReservationUserCardPrintButton } from "../reservations/ReservationUserCardPrintButton";
import { MawkibCardPrintButton } from "../mawkibs/MawkibCardPrintButton";
import { ExtendReservationModal } from "../reservations/ExtendReservationModal";
import { reservationMawkibToCardData } from "../../lib/mawkib-card";
import {
  ReservationAttendanceModal,
  type AttendanceType,
} from "../reservations/ReservationAttendanceModal";
import { GuestCountBadges } from "../reservations/GuestCountBadges";
import { RESERVATION_STATUS_LABELS } from "../../lib/constants";
import { formatTimeFa, formatTimeFromIso, buildRecordedAtFromDateAndTime, currentTimeInputValue, todayLocalGregorianDateString } from "../../lib/format-time";
import { reservationEventsApi } from "../../lib/reservation-events-api";
import {
  getPresenceCardClass,
  PresenceBadge,
  tempInActionBtn,
  tempOutActionBtn,
} from "../reservations/reservation-presence-ui";
import { lookupOwnerReservation } from "../../lib/mawkib-owner-dashboard";
import type { lookupAdminReservation } from "../../lib/admin-dashboard";
import { reservationsApi } from "../../lib/reservations";
import {
  canExtendReservation,
  extensionSuccessMessage,
} from "../../lib/reservation-extend";
import { useAuth } from "../../contexts/AuthContext";
import { btnAction, btnPrimary, inputClass } from "../../lib/styles";
import { toast, toastApiError } from "../../lib/toast";
import type { Reservation } from "../../types";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 ring-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Cancelled: "bg-red-100 text-red-700 ring-red-200",
  Completed: "bg-slate-100 text-slate-700 ring-slate-200",
};

const dashboardActionBtn = `${btnAction} inline-flex shrink-0 items-center justify-center gap-1.5 border !min-h-8 !px-2.5 !py-1.5 !text-[11px]`;
const dashboardSecondaryBtn = `${dashboardActionBtn} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;

function StatusBadge({ status }: { status: Reservation["status"] }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium ring-1 ${statusColors[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {RESERVATION_STATUS_LABELS[status]}
    </span>
  );
}

function InfoCell({
  icon,
  label,
  value,
  dir,
  accent = false,
  valueBold = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  dir?: "ltr" | "rtl";
  accent?: boolean;
  valueBold?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#e8eef6] text-[#4a6fa5]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-slate-500">{label}</p>
        <p
          className={`truncate ${valueBold ? "text-sm font-bold" : "text-xs font-semibold"} ${accent ? "text-emerald-700" : "text-slate-800"} ${dir === "ltr" && !valueBold && typeof value === "string" ? "font-mono" : ""}`}
          dir={dir}
          title={typeof value === "string" ? value : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function TrackResultRow({
  reservation,
  onOpenAttendance,
  onRequestCheckOut,
  onRecordTempEvent,
  onReservationUpdate,
  onRequestExtend,
  attendanceLoading,
  extendLoadingId,
  detailsLinkRef,
  highlightDetails = false,
  showCheckIn = true,
  showCheckInOutTimes = true,
  isAdmin = false,
  isMawkibOwner = false,
}: {
  reservation: Reservation;
  onOpenAttendance: (id: number, type: AttendanceType) => void;
  onRequestCheckOut: (id: number) => void;
  onRecordTempEvent: (id: number, eventType: "TEMP_OUT" | "TEMP_IN") => void;
  onReservationUpdate: (reservation: Reservation) => void;
  onRequestExtend: (id: number) => void;
  attendanceLoading: boolean;
  extendLoadingId: number | null;
  detailsLinkRef?: RefObject<HTMLAnchorElement | null>;
  highlightDetails?: boolean;
  showCheckIn?: boolean;
  showCheckInOutTimes?: boolean;
  isAdmin?: boolean;
  isMawkibOwner?: boolean;
}) {
  const endDate = reservation.reservationEndDate ?? reservation.reservationDate;
  const hasActualCheckIn = !!reservation.actualCheckInAt;
  const hasActualCheckOut = !!reservation.actualCheckOutAt;
  const checkInTime = hasActualCheckIn
    ? formatTimeFromIso(reservation.actualCheckInAt) || "—"
    : formatTimeFa(
        reservation.plannedCheckInTime ?? reservation.mawkib.defaultCheckInTime,
      );
  const checkOutTime = hasActualCheckOut
    ? formatTimeFromIso(reservation.actualCheckOutAt) || "—"
    : formatTimeFa(
        reservation.plannedCheckOutTime ?? reservation.mawkib.defaultCheckOutTime,
      );
  const guestCount = (
    <GuestCountBadges
      male={reservation.maleGuestCount}
      female={reservation.femaleGuestCount}
    />
  );
  const canCheckIn =
    reservation.status === "Confirmed" && !reservation.actualCheckInAt;
  const canCheckOut =
    reservation.status === "Confirmed" &&
    !!reservation.actualCheckInAt &&
    !reservation.actualCheckOutAt;

  const showPresence =
    reservation.status === "Confirmed" || reservation.status === "Completed";
  const presence = reservation.presenceState;
  const canTempOut = showCheckIn && presence === "PRESENT";
  const canTempIn = showCheckIn && presence === "TEMPORARILY_OUT";
  const stayRange = formatPersianDateRange(
    reservation.reservationDate.slice(0, 10),
    endDate.slice(0, 10),
  );
  const canExtend = canExtendReservation(reservation);
  const showExtend = canExtend && (isAdmin || isMawkibOwner);
  const extendBtnClass = `${dashboardSecondaryBtn} border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6]`;

  return (
    <section className={getPresenceCardClass(showPresence ? presence : undefined)}>
      <div className="p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
            <NavIcon name="pilgrims" className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {reservation.pilgrim.fullName}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500">
              <NavIcon name="mawkibs" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{reservation.mawkib.name}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {showPresence && presence && <PresenceBadge presence={presence} />}
          <StatusBadge status={reservation.status} />
        </div>
      </div>

      <div
        className={`mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 ${showCheckInOutTimes ? "lg:grid-cols-6" : "lg:grid-cols-4"}`}
      >
        <InfoCell
          icon={<NavIcon name="track" className="h-3.5 w-3.5" strokeWidth={1.75} />}
          label="کد رزرو"
          value={reservation.trackingCode}
          dir="ltr"
        />
        <InfoCell
          icon={<NavIcon name="login" className="h-3.5 w-3.5" strokeWidth={1.75} />}
          label="موبایل"
          value={reservation.pilgrim.mobileNumber}
          dir="ltr"
        />
        <InfoCell
          icon={<NavIcon name="reserve" className="h-3.5 w-3.5" strokeWidth={1.75} />}
          label="تاریخ اقامت"
          value={stayRange}
        />
        <InfoCell
          icon={<NavIcon name="users" className="h-3.5 w-3.5" strokeWidth={1.75} />}
          label="تعداد"
          value={guestCount}
        />
        {showCheckInOutTimes && (
          <>
            <InfoCell
              icon={<NavIcon name="check" className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label={hasActualCheckIn ? "ورود واقعی" : "ساعت ورود"}
              value={checkInTime}
              dir="ltr"
              accent={hasActualCheckIn}
              valueBold
            />
            <InfoCell
              icon={<NavIcon name="logout" className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label={hasActualCheckOut ? "خروج واقعی" : "ساعت خروج"}
              value={checkOutTime}
              dir="ltr"
              accent={hasActualCheckOut}
              valueBold
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        <Link
          ref={detailsLinkRef}
          to={`/reservations/${reservation.id}`}
          className={`${dashboardSecondaryBtn} ${
            highlightDetails
              ? "border-[#4a6fa5] bg-[#f0f4fa] text-[#4a6fa5] ring-2 ring-[#4a6fa5]/25 focus:outline-none focus-visible:ring-[#4a6fa5]/40"
              : ""
          }`}
        >
          <NavIcon name="info" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          مشاهده جزئیات
        </Link>
        <ReservationMealPlanLink
          reservation={reservation}
          isAdmin={isAdmin}
          isMawkibOwner={isMawkibOwner}
          className={`${dashboardSecondaryBtn} border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100`}
        />
        {showCheckIn && canCheckIn && (
          <button
            type="button"
            onClick={() => onOpenAttendance(reservation.id, "check-in")}
            disabled={attendanceLoading}
            className={`${btnPrimary} inline-flex shrink-0 items-center justify-center gap-1.5 !min-h-8 !px-2.5 !py-1.5 !text-[11px] !bg-emerald-600 hover:!bg-emerald-700`}
          >
            <NavIcon name="login" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            {attendanceLoading ? "..." : "ثبت ورود"}
          </button>
        )}
        <ReservationDeliveredItemsButton
          reservation={reservation}
          reservationId={reservation.id}
          className={dashboardSecondaryBtn}
          onUpdate={onReservationUpdate}
        />
        <PilgrimCardViewButton
          trackingCode={reservation.trackingCode}
          reservation={reservation}
          className={dashboardSecondaryBtn}
        />
        <ReservationUserCardPrintButton
          reservation={reservation}
          className={dashboardSecondaryBtn}
        />
        <MawkibCardPrintButton
          data={reservationMawkibToCardData(reservation.mawkib)}
          className={dashboardSecondaryBtn}
        />
        {showExtend && (
          <button
            type="button"
            onClick={() => onRequestExtend(reservation.id)}
            disabled={extendLoadingId === reservation.id}
            className={extendBtnClass}
          >
            <svg
              className="h-3.5 w-3.5 shrink-0"
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
            {extendLoadingId === reservation.id ? "..." : "تمدید رزرو"}
          </button>
        )}
        {(canTempOut || canTempIn || (showCheckIn && canCheckOut)) && (
          <div className="ms-auto flex flex-wrap gap-2">
            {canTempOut && (
              <button
                type="button"
                onClick={() => onRecordTempEvent(reservation.id, "TEMP_OUT")}
                disabled={attendanceLoading}
                className={tempOutActionBtn}
                title="خروج موقت"
              >
                <NavIcon name="logout" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                {attendanceLoading ? "..." : "خروج موقت"}
              </button>
            )}
            {canTempIn && (
              <button
                type="button"
                onClick={() => onRecordTempEvent(reservation.id, "TEMP_IN")}
                disabled={attendanceLoading}
                className={tempInActionBtn}
                title="ورود موقت"
              >
                <NavIcon name="login" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                {attendanceLoading ? "..." : "ورود موقت"}
              </button>
            )}
            {showCheckIn && canCheckOut && (
              <button
                type="button"
                onClick={() => onRequestCheckOut(reservation.id)}
                disabled={attendanceLoading}
                className={dashboardSecondaryBtn}
                title="خروج نهایی"
              >
                <NavIcon name="logout" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                {attendanceLoading ? "..." : "خروج نهایی"}
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </section>
  );
}

type LookupResult = Awaited<
  ReturnType<typeof lookupOwnerReservation | typeof lookupAdminReservation>
>;

interface ReservationTrackLookupProps {
  lookupFn?: (query: string) => Promise<LookupResult>;
  showCheckIn?: boolean;
  showCheckInOutTimes?: boolean;
  /** Called after check-in/check-out succeeds (e.g. refresh dashboard stats). */
  onAttendanceSuccess?: (type: AttendanceType) => void;
}

export function ReservationTrackLookup({
  lookupFn = lookupOwnerReservation,
  showCheckIn = true,
  showCheckInOutTimes = false,
  onAttendanceSuccess,
}: ReservationTrackLookupProps = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const detailsLinkRef = useRef<HTMLAnchorElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingInId, setCheckingInId] = useState<number | null>(null);
  const [attendanceModal, setAttendanceModal] = useState<{
    id: number;
    type: AttendanceType;
  } | null>(null);
  const [checkOutConfirmId, setCheckOutConfirmId] = useState<number | null>(null);
  const [extendReservationId, setExtendReservationId] = useState<number | null>(null);
  const [extendingId, setExtendingId] = useState<number | null>(null);
  const [results, setResults] = useState<Reservation[]>([]);
  const [searched, setSearched] = useState(false);

  const resetResults = () => {
    setResults([]);
    setSearched(false);
  };

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error("لطفاً شماره موبایل، کد ملی یا شناسه رزرو را وارد کنید");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const result = await lookupFn(trimmed);
      const matches = result.reservation
        ? [result.reservation, ...result.alternatives]
        : [];
      setResults(matches);
    } catch (err) {
      resetResults();
      setSearched(true);
      toastApiError(err, "خطا در جستجوی رزرو");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (results.length > 0) {
      navigate(`/reservations/${results[0].id}`);
      return;
    }
    void handleSearch();
  };

  const handleOpenAttendance = (id: number, type: AttendanceType) => {
    setAttendanceModal({ id, type });
  };

  const handleRequestCheckOut = (id: number) => {
    setCheckOutConfirmId(id);
  };

  const handleConfirmCheckOutRequest = () => {
    if (checkOutConfirmId === null) return;
    setAttendanceModal({ id: checkOutConfirmId, type: "check-out" });
    setCheckOutConfirmId(null);
  };

  const checkOutConfirmReservation = results.find((r) => r.id === checkOutConfirmId);
  const extendReservation = results.find((r) => r.id === extendReservationId);

  const handleExtendSubmit = async (reservationEndDate: string) => {
    if (extendReservationId === null) return;
    setExtendingId(extendReservationId);
    try {
      const created = await reservationsApi.extend(extendReservationId, {
        reservationEndDate,
      });
      queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
      queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success(extensionSuccessMessage(created.status));
      setExtendReservationId(null);
      navigate(`/reservations/${created.id}`);
    } catch (err) {
      toastApiError(err, "خطا در ثبت تمدید رزرو");
      throw err;
    } finally {
      setExtendingId(null);
    }
  };

  const handleConfirmAttendance = async (recordedAt: string) => {
    if (!attendanceModal) return;
    const { id, type } = attendanceModal;
    setCheckingInId(id);
    try {
      const updated =
        type === "check-in"
          ? await reservationsApi.checkIn(id, recordedAt)
          : await reservationsApi.checkOut(id, recordedAt);
      setResults((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(
        type === "check-in"
          ? "ساعت ورود زائر گرامی با موفقیت در سیستم ثبت شد"
          : "ساعت خروج زائر گرامی با موفقیت در سیستم ثبت شد",
      );
      if (type === "check-out" && updated.mealPlanNotice) {
        toast.warning(updated.mealPlanNotice);
      }
      await queryClient.invalidateQueries({ queryKey: ["reservation-events", id] });
      onAttendanceSuccess?.(type);
    } catch (err) {
      toastApiError(err, type === "check-in" ? "خطا در ثبت ورود" : "خطا در ثبت خروج");
      throw err;
    } finally {
      setCheckingInId(null);
    }
  };

  const handleRecordTempEvent = async (
    id: number,
    eventType: "TEMP_OUT" | "TEMP_IN",
  ) => {
    setCheckingInId(id);
    try {
      const recordedAt = buildRecordedAtFromDateAndTime(
        todayLocalGregorianDateString(),
        currentTimeInputValue(),
      );
      const result = await reservationEventsApi.record(id, { eventType, recordedAt });
      if (result.reservation && typeof result.reservation === "object" && "id" in result.reservation) {
        setResults((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, ...(result.reservation as Reservation) } : item,
          ),
        );
      }
      toast.success(
        eventType === "TEMP_OUT"
          ? "خروج موقت ثبت شد"
          : "ورود موقت ثبت شد",
      );
      onAttendanceSuccess?.(eventType === "TEMP_OUT" ? "check-out" : "check-in");
    } catch (err) {
      toastApiError(err, "خطا در ثبت رویداد");
    } finally {
      setCheckingInId(null);
    }
  };

  const handleReservationUpdate = (updated: Reservation) => {
    setResults((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const activeAttendanceReservation = attendanceModal
    ? results.find((item) => item.id === attendanceModal.id)
    : undefined;

  const activeCheckoutBounds = activeAttendanceReservation
    ? {
        min: activeAttendanceReservation.reservationDate.slice(0, 10),
        max: (
          activeAttendanceReservation.reservationEndDate ??
          activeAttendanceReservation.reservationDate
        ).slice(0, 10),
      }
    : undefined;

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (results.length === 0) return;
    const frameId = window.requestAnimationFrame(() => {
      detailsLinkRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [results]);

  return (
    <div className="space-y-3">
      <section className="w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm md:w-[346px] md:max-w-[346px]">
        <form onSubmit={handleSubmit} className="space-y-2 p-2.5 sm:p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
              <NavIcon name="track" className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h2 className="text-sm font-semibold text-slate-800">پیگیری رزرو</h2>
          </div>

          <div className="flex flex-col gap-1.5 sm:flex-row">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (searched) resetResults();
              }}
              className={`${inputClass} min-w-0 flex-1 !min-h-9 !py-2 text-right !text-sm`}
              placeholder="موبایل، کد ملی یا شناسه رزرو"
              dir="ltr"
              inputMode="text"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={loading}
              className={`${btnPrimary} inline-flex shrink-0 items-center justify-center gap-1 !min-h-9 !px-3 !py-2 !text-xs sm:min-w-[5.5rem]`}
            >
              <NavIcon name="track" className="h-3.5 w-3.5" strokeWidth={1.75} />
              {loading ? "..." : "جستجو"}
            </button>
          </div>
        </form>

        {searched && !loading && results.length === 0 && (
          <div className="flex items-center gap-2 border-t border-slate-100 px-2.5 py-2 text-[11px] text-slate-500 sm:px-3">
            <NavIcon name="track" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>رزروی با این مشخصات یافت نشد.</span>
          </div>
        )}
      </section>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((reservation, index) => (
              <TrackResultRow
                key={reservation.id}
                reservation={reservation}
                onOpenAttendance={handleOpenAttendance}
                onRequestCheckOut={handleRequestCheckOut}
                onRecordTempEvent={handleRecordTempEvent}
                onReservationUpdate={handleReservationUpdate}
                onRequestExtend={setExtendReservationId}
                attendanceLoading={checkingInId === reservation.id}
                extendLoadingId={extendingId}
                detailsLinkRef={index === 0 ? detailsLinkRef : undefined}
                highlightDetails={index === 0}
                showCheckIn={showCheckIn}
                showCheckInOutTimes={showCheckInOutTimes}
                isAdmin={isAdmin}
                isMawkibOwner={isMawkibOwner}
              />
          ))}
        </div>
      )}
      <ConfirmDialog
        open={checkOutConfirmId !== null}
        onClose={() => setCheckOutConfirmId(null)}
        onConfirm={handleConfirmCheckOutRequest}
        title="خروج نهایی"
        message={
          checkOutConfirmReservation
            ? `آیا از ثبت خروج نهایی «${checkOutConfirmReservation.pilgrim.fullName}» مطمئن هستید؟ پس از خروج نهایی، رزرو تکمیل می‌شود.`
            : "آیا از ثبت خروج نهایی مطمئن هستید؟"
        }
        confirmLabel="خروج نهایی"
        variant="danger"
      />
      <ReservationAttendanceModal
        open={attendanceModal !== null}
        type={attendanceModal?.type ?? "check-in"}
        initialRecordedAt={
          attendanceModal?.type === "check-out"
            ? activeAttendanceReservation?.actualCheckOutAt
            : activeAttendanceReservation?.actualCheckInAt
        }
        checkoutDateBounds={
          attendanceModal?.type === "check-out"
            ? activeCheckoutBounds
            : undefined
        }
        onClose={() => setAttendanceModal(null)}
        onConfirm={handleConfirmAttendance}
      />
      {extendReservation && (
        <ExtendReservationModal
          open={extendReservationId !== null}
          reservation={extendReservation}
          onClose={() => setExtendReservationId(null)}
          onSubmit={handleExtendSubmit}
        />
      )}
    </div>
  );
}
