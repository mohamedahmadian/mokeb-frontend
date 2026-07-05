import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import arabic from "react-date-object/calendars/arabic";
import arabic_fa from "react-date-object/locales/arabic_fa";
import gregorian from "react-date-object/calendars/gregorian";
import { Modal } from "../Modal";
import { PersianDateInput, formatPersianDate } from "../ui/PersianDateInput";
import {
  formatOccupiedFraction,
  formatPersianNumber,
} from "../../lib/capacity";
import { RemainingCapacityHint } from "./RemainingCapacityHint";
import {
  countDaysInclusive,
  defaultCapacityRange,
  getCapacityDateBounds,
  isRangeWithinBounds,
  todayGregorian,
} from "../../lib/date-range";
import { getApiErrorMessage } from "../../lib/constants";
import { buildGuestReserveUrl, buildPanelReserveUrl } from "../../lib/guest-reserve";
import { guestTheme } from "../../lib/guest-theme";
import { btnPrimary, btnSecondary, filterInputClass } from "../../lib/styles";
import { mawkibsApi, type MawkibDailyInventoryDay } from "../../lib/mawkibs";

type DayStatus = "available" | "partial" | "full";

interface MawkibCapacityViewModalProps {
  open: boolean;
  onClose: () => void;
  mawkibId: number;
  mawkibName: string;
  serviceStartDate?: string | null;
  serviceEndDate?: string | null;
  /** Use authenticated API for non-public mawkibs (admin/owner). */
  authenticated?: boolean;
  /** Show hover «رزرو» on day cards — guest pages use public reserve URL; panel uses /reservations/new. */
  guestReserveLinks?: boolean;
}

function persianWeekday(dateStr: string): string {
  const date = new DateObject({ date: dateStr, calendar: gregorian }).convert(
    persian,
    persian_fa,
  );
  return date.format("dddd");
}

function persianDayNumber(dateStr: string): string {
  const date = new DateObject({ date: dateStr, calendar: gregorian }).convert(
    persian,
    persian_fa,
  );
  return date.format("D");
}

function persianMonthLabel(dateStr: string): string {
  const date = new DateObject({ date: dateStr, calendar: gregorian }).convert(
    persian,
    persian_fa,
  );
  return date.format("MMMM");
}

function hijriCompactLabel(dateStr: string): string {
  const date = new DateObject({ date: dateStr, calendar: gregorian }).convert(
    arabic,
    arabic_fa,
  );
  return `${date.format("D")} ${date.format("MMMM")}`;
}

function RemainingLabelInline({ available }: { available: number }) {
  return (
    <RemainingCapacityHint
      available={available}
      className="text-emerald-700"
      fullClassName="text-[8px] leading-tight text-red-600"
    />
  );
}

function getDayStatus(day: MawkibDailyInventoryDay): DayStatus {
  const maleFull = day.availableMale <= 0;
  const femaleFull = day.availableFemale <= 0;
  if (maleFull && femaleFull) return "full";
  if (maleFull || femaleFull) return "partial";
  return "available";
}

const statusStyles: Record<
  DayStatus,
  { card: string; barMale: string; barFemale: string; reserveHover: string }
> = {
  available: {
    card: "border-sky-200 bg-gradient-to-b from-sky-50 to-white",
    barMale: "bg-sky-400",
    barFemale: "bg-sky-300",
    reserveHover:
      "group-hover:border-sky-400 group-hover:shadow-lg group-hover:shadow-sky-200/70 group-hover:from-white group-hover:to-white",
  },
  partial: {
    card: "border-emerald-200 bg-gradient-to-b from-emerald-50 to-white",
    barMale: "bg-emerald-500",
    barFemale: "bg-emerald-400",
    reserveHover:
      "group-hover:border-emerald-500 group-hover:shadow-lg group-hover:shadow-emerald-200/70 group-hover:from-white group-hover:to-white",
  },
  full: {
    card: "border-red-200 bg-gradient-to-b from-red-50 to-white",
    barMale: "bg-red-400",
    barFemale: "bg-red-300",
    reserveHover:
      "group-hover:border-red-400 group-hover:shadow-lg group-hover:shadow-red-200/70 group-hover:from-white group-hover:to-white",
  },
};

function CapacityBar({
  label,
  reserved,
  available,
  total,
  barClass,
}: {
  label: string;
  reserved: number;
  available: number;
  total: number;
  barClass: string;
}) {
  const occupiedRatio =
    total > 0 ? Math.min(1, Math.max(0, reserved / total)) : 0;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-1 text-[10px]">
        <span className="text-slate-500">
          {label} <RemainingLabelInline available={available} />
        </span>
        <span
          className="font-semibold text-slate-700"
          title="رزرو شده / ظرفیت کل"
        >
          {formatOccupiedFraction(reserved, total)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className={`h-full rounded-full transition-all ${barClass}`}
          style={{ width: `${occupiedRatio * 100}%` }}
        />
      </div>
    </div>
  );
}

function IconReserve() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function DayCapacityCard({
  day,
  onReserve,
}: {
  day: MawkibDailyInventoryDay;
  onReserve?: () => void;
}) {
  const status = getDayStatus(day);
  const styles = statusStyles[status];
  const isToday = day.date === todayGregorian();

  return (
    <div
      className={`group relative flex aspect-square flex-col justify-between rounded-xl border p-2 shadow-sm transition-all duration-200 ${styles.card} ${
        onReserve
          ? `cursor-pointer ${styles.reserveHover} group-hover:border-2 group-hover:shadow-xl`
          : ""
      } ${isToday ? "ring-2 ring-[#4a6fa5]/40 ring-offset-1" : ""}`}
    >
      <div className="text-center">
        <p className="truncate text-[10px] font-medium text-slate-500">
          {persianWeekday(day.date)}
        </p>
        <p className="text-lg font-bold leading-none text-slate-800">
          {persianDayNumber(day.date)}
        </p>
        <p className="mt-0.5 truncate text-[9px] text-slate-400">
          {persianMonthLabel(day.date)}
        </p>
        <p className="mt-0.5 truncate text-[9px] font-medium text-violet-700/90">
          {hijriCompactLabel(day.date)}
        </p>
      </div>

      <div className="mt-3 space-y-1.5">
        <CapacityBar
          label="آقا"
          reserved={day.reservedMale}
          available={day.availableMale}
          total={day.maleCapacity}
          barClass={styles.barMale}
        />
        <CapacityBar
          label="بانو"
          reserved={day.reservedFemale}
          available={day.availableFemale}
          total={day.femaleCapacity}
          barClass={styles.barFemale}
        />
      </div>

      {onReserve && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 opacity-100 backdrop-blur-[1px] transition-all duration-200 max-md:pointer-events-auto md:bg-transparent md:opacity-0 md:backdrop-blur-none md:group-hover:bg-white/75 md:group-hover:opacity-100 md:group-hover:backdrop-blur-[1px] md:group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReserve();
            }}
            className={`${guestTheme.btnPrimary} pointer-events-auto inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-xs shadow-md`}
          >
            <IconReserve />
            رزرو
          </button>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

export function MawkibCapacityViewModal({
  open,
  onClose,
  mawkibId,
  mawkibName,
  serviceStartDate,
  serviceEndDate,
  authenticated = false,
  guestReserveLinks = false,
}: MawkibCapacityViewModalProps) {
  const navigate = useNavigate();

  const { data: horizon } = useQuery({
    queryKey: ["mawkib-inventory-horizon"],
    queryFn: () => mawkibsApi.getInventoryHorizon(),
    enabled: open,
    staleTime: 5 * 60_000,
  });

  const dateBounds = useMemo(
    () => getCapacityDateBounds(serviceStartDate, serviceEndDate, horizon),
    [serviceStartDate, serviceEndDate, horizon],
  );

  const defaults = useMemo(
    () => defaultCapacityRange(dateBounds ?? undefined),
    [open, dateBounds],
  );

  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [appliedRange, setAppliedRange] = useState(defaults);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return;
    const range = defaultCapacityRange(dateBounds ?? undefined);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setAppliedRange(range);
    setValidationError("");
  }, [open, mawkibId, dateBounds]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      "mawkib-inventory",
      mawkibId,
      appliedRange.startDate,
      appliedRange.endDate,
      authenticated,
    ],
    queryFn: () =>
      authenticated
        ? mawkibsApi.getInventory(
            mawkibId,
            appliedRange.startDate,
            appliedRange.endDate,
          )
        : mawkibsApi.getPublicInventory(
            mawkibId,
            appliedRange.startDate,
            appliedRange.endDate,
          ),
    enabled: open && mawkibId > 0 && !!dateBounds,
  });

  const validateAndApply = () => {
    if (!dateBounds) {
      setAppliedRange({ startDate, endDate });
      void refetch();
      return;
    }

    if (endDate < startDate) {
      setValidationError("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد");
      return;
    }

    if (
      !isRangeWithinBounds(
        startDate,
        endDate,
        dateBounds.minDate,
        dateBounds.maxDate,
      )
    ) {
      setValidationError(
        dateBounds.isServicePeriod
          ? `بازه مجاز بر اساس ارائه خدمت موکب: ${formatPersianDate(dateBounds.minDate)} تا ${formatPersianDate(dateBounds.maxDate)}`
          : `بازه مجاز: ${formatPersianDate(dateBounds.minDate)} تا ${formatPersianDate(dateBounds.maxDate)} (${formatPersianNumber(horizon?.horizonDays ?? 0)} روز آینده)`,
      );
      return;
    }

    setValidationError("");
    setAppliedRange({ startDate, endDate });
  };

  const handleDayReserve = useMemo(() => {
    if (guestReserveLinks) {
      return (date: string) => {
        onClose();
        navigate(buildGuestReserveUrl(mawkibId, date));
      };
    }
    if (authenticated) {
      return (date: string) => {
        onClose();
        navigate(buildPanelReserveUrl(mawkibId, date));
      };
    }
    return undefined;
  }, [authenticated, guestReserveLinks, mawkibId, navigate, onClose]);

  const summary = useMemo(() => {
    if (!data?.days.length) return null;

    const minMale = Math.min(...data.days.map((d) => d.availableMale));
    const minFemale = Math.min(...data.days.map((d) => d.availableFemale));
    const fullDays = data.days.filter((d) => getDayStatus(d) === "full").length;

    return { minMale, minFemale, fullDays, dayCount: data.days.length };
  }, [data]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`ظرفیت روزانه — ${mawkibName}`}
      size="xl"
    >
      <div className="space-y-4">
        {dateBounds && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {dateBounds.isServicePeriod ? (
              <>
                بازه ارائه خدمت موکب:{" "}
                <span className="font-medium text-slate-700">
                  {formatPersianDate(dateBounds.minDate)}
                </span>{" "}
                تا{" "}
                <span className="font-medium text-slate-700">
                  {formatPersianDate(dateBounds.maxDate)}
                </span>
              </>
            ) : (
              <>
                بازه قابل مشاهده: از امروز تا{" "}
                <span className="font-medium text-slate-700">
                  {formatPersianDate(dateBounds.maxDate)}
                </span>{" "}
                ({formatPersianNumber(horizon?.horizonDays ?? 0)} روز آینده)
              </>
            )}
          </p>
        )}

        {!dateBounds && open && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            بازه ارائه خدمت برای این موکب تعریف نشده است.
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <PersianDateInput
            label="از تاریخ"
            value={startDate}
            onChange={setStartDate}
            minDate={dateBounds?.minDate}
            maxDate={dateBounds?.maxDate}
            disabled={!dateBounds}
            inputClassName={filterInputClass}
          />
          <PersianDateInput
            label="تا تاریخ"
            value={endDate}
            onChange={setEndDate}
            minDate={startDate || dateBounds?.minDate}
            maxDate={dateBounds?.maxDate}
            disabled={!dateBounds}
            inputClassName={filterInputClass}
          />
          <button
            type="button"
            onClick={validateAndApply}
            disabled={!dateBounds}
            className={`${btnPrimary} w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50`}
          >
            نمایش
          </button>
        </div>

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}

        {isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {getApiErrorMessage(error, "خطا در دریافت ظرفیت")}
          </p>
        )}

        {summary && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center">
              <p className="text-[10px] text-slate-500">تعداد روز</p>
              <p className="text-lg font-bold text-slate-800">
                {formatPersianNumber(summary.dayCount)}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-center">
              <p className="text-[10px] text-slate-500">
                کمترین باقی‌مانده (آقا)
              </p>
              <p className="text-lg font-bold text-emerald-700">
                {formatPersianNumber(summary.minMale)}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-center">
              <p className="text-[10px] text-slate-500">
                کمترین باقی‌مانده (بانو)
              </p>
              <p className="text-lg font-bold text-emerald-700">
                {formatPersianNumber(summary.minFemale)}
              </p>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50/60 px-3 py-2 text-center">
              <p className="text-[10px] text-slate-500">روزهای پر</p>
              <p className="text-lg font-bold text-red-600">
                {formatPersianNumber(summary.fullDays)}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 border-y border-slate-100 py-3">
          <LegendItem color="bg-sky-300" label="روز با ظرفیت آزاد" />
          <LegendItem color="bg-emerald-400" label="بخشی پر شده" />
          <LegendItem color="bg-red-300" label="کاملاً پر" />
          <span className="text-xs text-slate-400">
            — نوار پر = سهم رزرو شده
          </span>
          {handleDayReserve && (
            <span className="text-xs text-[#4a6fa5]">
              — برای رزرو، روی روز مورد نظر بروید
            </span>
          )}
        </div>

        {isLoading || isFetching ? (
          <div className="flex justify-center py-12">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#4a6fa5]" />
          </div>
        ) : data?.days.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {data.days.map((day) => (
              <DayCapacityCard
                key={day.date}
                day={day}
                onReserve={
                  handleDayReserve
                    ? () => handleDayReserve(day.date)
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          !isError && (
            <p className="py-8 text-center text-sm text-slate-400">
              داده‌ای برای نمایش وجود ندارد
            </p>
          )
        )}

        {data && (
          <p className="text-center text-xs text-slate-400">
            {formatPersianNumber(
              countDaysInclusive(data.startDate, data.endDate),
            )}{" "}
            روز — از {formatPersianDate(data.startDate)} تا{" "}
            {formatPersianDate(data.endDate)}
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className={btnSecondary}>
            بستن
          </button>
        </div>
      </div>
    </Modal>
  );
}
