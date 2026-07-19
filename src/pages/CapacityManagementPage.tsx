import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavIcon } from "../components/ui/NavIcons";
import { PersianDateInput, formatPersianDate } from "../components/ui/PersianDateInput";
import {
  countDaysInclusive,
  defaultCapacityRange,
  getCapacityDateBounds,
  todayGregorian,
} from "../lib/date-range";
import { formatOccupiedFraction, formatPersianNumber } from "../lib/capacity";
import { mawkibsApi } from "../lib/mawkibs";
import { btnPrimary, filterInputClass } from "../lib/styles";
import { toast, toastApiError } from "../lib/toast";
import { reservationFormInputClass } from "../components/reservations/reservation-form-ui";

export function CapacityManagementPage() {
  const queryClient = useQueryClient();
  const today = todayGregorian();

  const [mawkibId, setMawkibId] = useState<number | "">("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() =>
    defaultCapacityRange().endDate,
  );
  const [lastResult, setLastResult] = useState<{
    daysUpdated: number;
    reservationsProcessed: number;
  } | null>(null);

  const { data: mawkibs = [], isLoading: mawkibsLoading } = useQuery({
    queryKey: ["mawkibs", "admin", "capacity-management"],
    queryFn: () => mawkibsApi.getAdminList({ all: true }),
  });

  const { data: horizon } = useQuery({
    queryKey: ["mawkib-inventory-horizon"],
    queryFn: mawkibsApi.getInventoryHorizon,
  });

  const selectedMawkib = useMemo(
    () => mawkibs.find((m) => m.id === mawkibId) ?? null,
    [mawkibs, mawkibId],
  );

  const dateBounds = useMemo(
    () =>
      getCapacityDateBounds(
        selectedMawkib?.serviceStartDate,
        selectedMawkib?.serviceEndDate,
        horizon,
      ),
    [selectedMawkib, horizon],
  );

  const reconcileMutation = useMutation({
    mutationFn: () =>
      mawkibsApi.reconcileInventory(
        mawkibId as number,
        startDate,
        endDate,
      ),
    onSuccess: (result) => {
      setLastResult({
        daysUpdated: result.daysUpdated,
        reservationsProcessed: result.reservationsProcessed,
      });
      queryClient.invalidateQueries({ queryKey: ["mawkib-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["mawkibs"] });
      toast.success(
        `ظرفیت ${formatPersianNumber(result.daysUpdated)} روز به‌روزرسانی شد (${formatPersianNumber(result.reservationsProcessed)} رزرو تایید‌شده)`,
      );
    },
    onError: (err) => toastApiError(err, "خطا در به‌روزرسانی ظرفیت"),
  });

  const previewQuery = useQuery({
    queryKey: [
      "mawkib-inventory",
      "capacity-management-preview",
      mawkibId,
      startDate,
      endDate,
    ],
    queryFn: () =>
      mawkibsApi.getInventory(mawkibId as number, startDate, endDate),
    enabled:
      typeof mawkibId === "number" &&
      mawkibId > 0 &&
      !!startDate &&
      !!endDate &&
      startDate <= endDate,
  });

  const handleReconcile = () => {
    if (!mawkibId) {
      toast.error("موکب را انتخاب کنید");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("بازه تاریخ را مشخص کنید");
      return;
    }
    if (startDate > endDate) {
      toast.error("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد");
      return;
    }
    reconcileMutation.mutate();
  };

  const rangeDays = startDate && endDate ? countDaysInclusive(startDate, endDate) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          مدیریت ظرفیت
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          محاسبه مجدد ظرفیت روزانه موکب بر اساس رزروهای تایید‌شده — همان منطقی
          که پس از تایید یا لغو رزرو اجرا می‌شود.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              موکب *
            </span>
            <select
              value={mawkibId}
              onChange={(e) => {
                const nextId = e.target.value ? Number(e.target.value) : "";
                setMawkibId(nextId);
                setLastResult(null);
                if (nextId) {
                  const mawkib = mawkibs.find((item) => item.id === nextId);
                  const bounds = getCapacityDateBounds(
                    mawkib?.serviceStartDate,
                    mawkib?.serviceEndDate,
                    horizon,
                  );
                  if (bounds) {
                    const range = defaultCapacityRange(bounds);
                    setStartDate(range.startDate);
                    setEndDate(range.endDate);
                  }
                }
              }}
              className={`${filterInputClass} w-full`}
              disabled={mawkibsLoading}
            >
              <option value="">
                {mawkibsLoading ? "در حال بارگذاری..." : "انتخاب موکب"}
              </option>
              {mawkibs.map((mawkib) => (
                <option key={mawkib.id} value={mawkib.id}>
                  {mawkib.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              تاریخ شروع *
            </span>
            <PersianDateInput
              compact
              value={startDate}
              onChange={(value) => {
                setStartDate(value);
                setLastResult(null);
              }}
              minDate={dateBounds?.minDate}
              maxDate={dateBounds?.maxDate ?? endDate}
              inputClassName={reservationFormInputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              تاریخ پایان *
            </span>
            <PersianDateInput
              compact
              value={endDate}
              onChange={(value) => {
                setEndDate(value);
                setLastResult(null);
              }}
              minDate={startDate || dateBounds?.minDate}
              maxDate={dateBounds?.maxDate}
              inputClassName={reservationFormInputClass}
            />
          </label>
        </div>

        {selectedMawkib && dateBounds?.isServicePeriod ? (
          <p className="mt-3 text-xs text-slate-500">
            بازه مجاز ارائه خدمت:{" "}
            {formatPersianDate(dateBounds.minDate)} تا{" "}
            {formatPersianDate(dateBounds.maxDate)}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            {rangeDays > 0
              ? `${formatPersianNumber(rangeDays)} روز در بازه انتخاب‌شده`
              : "بازه تاریخ را مشخص کنید"}
          </p>
          <button
            type="button"
            onClick={handleReconcile}
            disabled={reconcileMutation.isPending || !mawkibId}
            className={`${btnPrimary} inline-flex w-full items-center justify-center gap-2 !min-h-10 px-5 py-2.5 text-sm sm:w-auto disabled:opacity-50`}
          >
            <NavIcon name="check" className="h-4 w-4" strokeWidth={1.75} />
            {reconcileMutation.isPending
              ? "در حال به‌روزرسانی..."
              : "به‌روزرسانی ظرفیت"}
          </button>
        </div>

        {lastResult ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            آخرین به‌روزرسانی: {formatPersianNumber(lastResult.daysUpdated)}{" "}
            روز و {formatPersianNumber(lastResult.reservationsProcessed)} رزرو
            تایید‌شده پردازش شد.
          </div>
        ) : null}
      </section>

      {typeof mawkibId === "number" && mawkibId > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold text-slate-900">
            وضعیت ظرفیت پس از به‌روزرسانی
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {selectedMawkib?.name} — {formatPersianDate(startDate)} تا{" "}
            {formatPersianDate(endDate)}
          </p>

          {previewQuery.isLoading ? (
            <p className="mt-4 text-sm text-slate-500">در حال بارگذاری...</p>
          ) : previewQuery.isError ? (
            <p className="mt-4 text-sm text-red-600">
              خطا در بارگذاری ظرفیت
            </p>
          ) : previewQuery.data?.days.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-right text-xs text-slate-500">
                    <th className="px-3 py-2 font-medium">تاریخ</th>
                    <th className="px-3 py-2 font-medium">آقایان</th>
                    <th className="px-3 py-2 font-medium">بانوان</th>
                  </tr>
                </thead>
                <tbody>
                  {previewQuery.data.days.map((day) => (
                    <tr
                      key={day.date}
                      className="border-b border-slate-100 text-slate-700"
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatPersianDate(day.date)}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {formatOccupiedFraction(
                          day.reservedMale,
                          day.maleCapacity,
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                        {day.femaleCapacity === 0
                          ? "—"
                          : formatOccupiedFraction(
                              day.reservedFemale,
                              day.femaleCapacity,
                            )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              داده‌ای برای این بازه یافت نشد.
            </p>
          )}
        </section>
      ) : null}
    </div>
  );
}
