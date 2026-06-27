import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatPersianDateRange } from "../ui/PersianDateRangePicker";
import { NavIcon } from "../ui/NavIcons";
import { formatGuestCount } from "../../lib/capacity";
import { RESERVATION_STATUS_LABELS } from "../../lib/constants";
import { formatTimeFa, formatTimeFromIso } from "../../lib/format-time";
import { lookupOwnerReservation } from "../../lib/mawkib-owner-dashboard";
import { reservationsApi } from "../../lib/reservations";
import { btnAction, btnPrimary, inputClass } from "../../lib/styles";
import { toast, toastApiError } from "../../lib/toast";
import type { Reservation } from "../../types";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800 ring-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Cancelled: "bg-red-100 text-red-700 ring-red-200",
  Completed: "bg-slate-100 text-slate-700 ring-slate-200",
};

function StatusBadge({ status }: { status: Reservation["status"] }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${statusColors[status] ?? "bg-slate-100 text-slate-700"}`}
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
  accent = false,
}: {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
  className?: string;
  accent?: boolean;
}) {
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className="text-[10px] text-slate-500">{label}</span>
      <span
        className={`text-[11px] font-semibold ${accent ? "text-emerald-700" : "text-slate-800"} ${dir === "ltr" ? "font-mono" : ""}`}
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

function TrackResultRow({
  reservation,
  onCheckIn,
  checkingIn,
  detailsLinkRef,
  highlightDetails = false,
}: {
  reservation: Reservation;
  onCheckIn: (id: number) => void;
  checkingIn: boolean;
  detailsLinkRef?: RefObject<HTMLAnchorElement | null>;
  highlightDetails?: boolean;
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
  const guestCount = formatGuestCount(
    reservation.maleGuestCount,
    reservation.femaleGuestCount,
  );
  const canCheckIn =
    reservation.status === "Confirmed" && !reservation.actualCheckInAt;
  const stayRange = formatPersianDateRange(
    reservation.reservationDate.slice(0, 10),
    endDate.slice(0, 10),
  );

  return (
    <div className="border-t border-[#c5d4e8]/60 bg-gradient-to-l from-[#f0f4fa]/80 to-white">
      <div className="flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center sm:gap-3 sm:p-3">
        <div className="min-w-0 flex-1 sm:pe-3 sm:border-e sm:border-[#c5d4e8]/60">
          <div className="mb-1 flex items-center justify-between gap-2">
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
            <MetaInline label="کد" value={reservation.trackingCode} dir="ltr" />
            <MetaDivider />
            <MetaInline
              label="موبایل"
              value={reservation.pilgrim.mobileNumber}
              dir="ltr"
            />
            <MetaDivider />
            <MetaInline label="اقامت" value={stayRange} />
            <MetaDivider />
            <MetaInline label="مهمان" value={guestCount} />
            <MetaInline
              label={hasActualCheckIn ? "ورود واقعی" : "ورود"}
              value={checkInTime}
              dir="ltr"
              className="shrink-0"
              accent={hasActualCheckIn}
            />
            <MetaInline
              label={hasActualCheckOut ? "خروج واقعی" : "خروج"}
              value={checkOutTime}
              dir="ltr"
              className="shrink-0"
              accent={hasActualCheckOut}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-row gap-1.5 sm:w-auto sm:flex-col sm:gap-1">
          <Link
            ref={detailsLinkRef}
            to={`/reservations/${reservation.id}`}
            className={`${btnAction} inline-flex flex-1 items-center justify-center gap-1 border !min-h-8 !px-2.5 !py-1.5 !text-[11px] sm:w-full ${
              highlightDetails
                ? "border-[#4a6fa5] bg-[#f0f4fa] text-[#4a6fa5] ring-2 ring-[#4a6fa5]/25 focus:outline-none focus-visible:ring-[#4a6fa5]/40"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <NavIcon name="info" className="h-3.5 w-3.5" strokeWidth={1.75} />
            مشاهده جزئیات
          </Link>
          {canCheckIn && (
            <button
              type="button"
              onClick={() => onCheckIn(reservation.id)}
              disabled={checkingIn}
              className={`${btnPrimary} inline-flex flex-1 items-center justify-center gap-1 !min-h-8 !px-2.5 !py-1.5 !text-[11px] sm:w-full`}
            >
              <NavIcon name="check" className="h-3.5 w-3.5" strokeWidth={1.75} />
              {checkingIn ? "..." : "ثبت ساعت ورود به موکب"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReservationTrackLookup() {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const detailsLinkRef = useRef<HTMLAnchorElement>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingInId, setCheckingInId] = useState<number | null>(null);
  const [results, setResults] = useState<Reservation[]>([]);
  const [searched, setSearched] = useState(false);

  const resetResults = () => {
    setResults([]);
    setSearched(false);
  };

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error("لطفاً شماره موبایل یا کد رزرو را وارد کنید");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const result = await lookupOwnerReservation(trimmed);
      const matches = result.reservation
        ? [result.reservation, ...result.alternatives]
        : [];
      setResults(matches);
      if (matches.length === 0) {
        toast.error("رزروی با این مشخصات یافت نشد");
      }
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

  const handleCheckIn = async (id: number) => {
    setCheckingInId(id);
    try {
      const updated = await reservationsApi.checkIn(id);
      setResults((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success("ساعت ورود زائر گرامی با موفقیت در سیستم ثبت شد");
    } catch (err) {
      toastApiError(err, "خطا در ثبت ورود");
    } finally {
      setCheckingInId(null);
    }
  };

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
    <section className="w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="space-y-2 p-2.5 sm:p-3 md:max-w-[calc(50%-0.5rem)]"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
            <NavIcon name="track" className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">پیگیری رزرو</h2>
        </div>

        <div className="flex gap-1.5">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (searched) resetResults();
            }}
            className={`${inputClass} min-w-0 flex-1 !min-h-9 !py-2 text-right !text-sm`}
            placeholder="شماره موبایل یا شناسه رزرو"
            dir="rtl"
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
        <div className="flex items-center gap-2 border-t border-slate-100 px-2.5 py-2 text-[11px] text-slate-500 sm:px-3 md:max-w-[calc(50%-0.5rem)]">
          <NavIcon name="track" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>رزروی با این مشخصات یافت نشد.</span>
        </div>
      )}

      {results.map((reservation, index) => (
        <TrackResultRow
          key={reservation.id}
          reservation={reservation}
          onCheckIn={handleCheckIn}
          checkingIn={checkingInId === reservation.id}
          detailsLinkRef={index === 0 ? detailsLinkRef : undefined}
          highlightDetails={index === 0}
        />
      ))}
    </section>
  );
}
