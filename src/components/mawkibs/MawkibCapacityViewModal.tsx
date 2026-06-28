import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import arabic from 'react-date-object/calendars/arabic';
import arabic_fa from 'react-date-object/locales/arabic_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import { Modal } from '../Modal';
import { PersianDateInput, formatPersianDate } from '../ui/PersianDateInput';
import { formatOccupiedFraction, formatPersianNumber } from '../../lib/capacity';
import { RemainingCapacityHint } from './RemainingCapacityHint';
import {
  countDaysInclusive,
  defaultCapacityRange,
  isRangeWithinBounds,
  todayGregorian,
} from '../../lib/date-range';
import { getApiErrorMessage } from '../../lib/constants';
import { btnPrimary, btnSecondary, filterInputClass } from '../../lib/styles';
import { mawkibsApi, type MawkibDailyInventoryDay } from '../../lib/mawkibs';

type DayStatus = 'available' | 'partial' | 'full';

interface MawkibCapacityViewModalProps {
  open: boolean;
  onClose: () => void;
  mawkibId: number;
  mawkibName: string;
  /** Use authenticated API for non-public mawkibs (admin/owner). */
  authenticated?: boolean;
}

function persianWeekday(dateStr: string): string {
  const date = new DateObject({ date: dateStr, calendar: gregorian }).convert(
    persian,
    persian_fa,
  );
  return date.format('dddd');
}

function persianDayNumber(dateStr: string): string {
  const date = new DateObject({ date: dateStr, calendar: gregorian }).convert(
    persian,
    persian_fa,
  );
  return date.format('D');
}

function persianMonthLabel(dateStr: string): string {
  const date = new DateObject({ date: dateStr, calendar: gregorian }).convert(
    persian,
    persian_fa,
  );
  return date.format('MMMM');
}

function hijriCompactLabel(dateStr: string): string {
  const date = new DateObject({ date: dateStr, calendar: gregorian }).convert(
    arabic,
    arabic_fa,
  );
  return `${date.format('D')} ${date.format('MMMM')}`;
}

function RemainingLabelInline({ available }: { available: number }) {
  return (
    <RemainingCapacityHint
      available={available}
      className="font-medium text-emerald-700"
      fullClassName="text-[8px] font-semibold leading-tight text-red-600"
    />
  );
}

function getDayStatus(day: MawkibDailyInventoryDay): DayStatus {
  const maleFull = day.availableMale <= 0;
  const femaleFull = day.availableFemale <= 0;
  if (maleFull && femaleFull) return 'full';
  if (maleFull || femaleFull) return 'partial';
  return 'available';
}

const statusStyles: Record<
  DayStatus,
  { card: string; barMale: string; barFemale: string }
> = {
  available: {
    card: 'border-sky-200 bg-gradient-to-b from-sky-50 to-white',
    barMale: 'bg-sky-400',
    barFemale: 'bg-sky-300',
  },
  partial: {
    card: 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-white',
    barMale: 'bg-emerald-500',
    barFemale: 'bg-emerald-400',
  },
  full: {
    card: 'border-red-200 bg-gradient-to-b from-red-50 to-white',
    barMale: 'bg-red-400',
    barFemale: 'bg-red-300',
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
  const occupiedRatio = total > 0 ? Math.min(1, Math.max(0, reserved / total)) : 0;

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-1 text-[10px]">
        <span className="text-slate-500">
          {label}{' '}
          <RemainingLabelInline available={available} />
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

function DayCapacityCard({ day }: { day: MawkibDailyInventoryDay }) {
  const status = getDayStatus(day);
  const styles = statusStyles[status];
  const isToday = day.date === todayGregorian();

  return (
    <div
      className={`flex aspect-square flex-col justify-between rounded-xl border p-2 shadow-sm ${styles.card} ${
        isToday ? 'ring-2 ring-[#4a6fa5]/40 ring-offset-1' : ''
      }`}
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
  authenticated = false,
}: MawkibCapacityViewModalProps) {
  const defaults = useMemo(() => defaultCapacityRange(), [open]);
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [appliedRange, setAppliedRange] = useState(defaults);
  const [validationError, setValidationError] = useState('');

  const { data: horizon } = useQuery({
    queryKey: ['mawkib-inventory-horizon'],
    queryFn: () => mawkibsApi.getInventoryHorizon(),
    enabled: open,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!open) return;
    const range = defaultCapacityRange();
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setAppliedRange(range);
    setValidationError('');
  }, [open, mawkibId]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'mawkib-inventory',
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
    enabled: open && mawkibId > 0,
  });

  const validateAndApply = () => {
    if (!horizon) {
      setAppliedRange({ startDate, endDate });
      void refetch();
      return;
    }

    if (endDate < startDate) {
      setValidationError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد');
      return;
    }

    if (
      !isRangeWithinBounds(
        startDate,
        endDate,
        horizon.minDate,
        horizon.maxDate,
      )
    ) {
      setValidationError(
        `بازه مجاز: ${formatPersianDate(horizon.minDate)} تا ${formatPersianDate(horizon.maxDate)} (${formatPersianNumber(horizon.horizonDays)} روز آینده)`,
      );
      return;
    }

    setValidationError('');
    setAppliedRange({ startDate, endDate });
  };

  const summary = useMemo(() => {
    if (!data?.days.length) return null;

    const minMale = Math.min(...data.days.map((d) => d.availableMale));
    const minFemale = Math.min(...data.days.map((d) => d.availableFemale));
    const fullDays = data.days.filter((d) => getDayStatus(d) === 'full').length;

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
        <p className="text-sm leading-7 text-slate-600">
          وضعیت ظرفیت آقایان و بانوان را برای هر روز اقامت مشاهده کنید. فقط
          رزروهای{' '}
          <span className="font-medium text-slate-700">تاییدشده</span> در
          محاسبه لحاظ می‌شوند.
          <span className="mt-1 block text-xs text-slate-500">
            تاریخ هر روز به‌صورت شمسی و قمری نمایش داده می‌شود. عدد کنار نوار ={' '}
            <span className="font-medium text-slate-600">رزرو شده / ظرفیت کل</span>
            {' '}— عدد داخل پرانتز = ظرفیت خالی؛ در صورت پر بودن «تکمیل ظرفیت».
          </span>
        </p>

        {horizon && (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            بازه قابل مشاهده: از امروز تا{' '}
            <span className="font-medium text-slate-700">
              {formatPersianDate(horizon.maxDate)}
            </span>{' '}
            ({formatPersianNumber(horizon.horizonDays)} روز آینده)
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <PersianDateInput
            label="از تاریخ"
            value={startDate}
            onChange={setStartDate}
            minDate={horizon?.minDate}
            inputClassName={filterInputClass}
          />
          <PersianDateInput
            label="تا تاریخ"
            value={endDate}
            onChange={setEndDate}
            minDate={startDate || horizon?.minDate}
            inputClassName={filterInputClass}
          />
          <button
            type="button"
            onClick={validateAndApply}
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            نمایش
          </button>
        </div>

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}

        {isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {getApiErrorMessage(error, 'خطا در دریافت ظرفیت')}
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
              <p className="text-[10px] text-slate-500">کمترین باقی‌مانده (آقا)</p>
              <p className="text-lg font-bold text-emerald-700">
                {formatPersianNumber(summary.minMale)}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-center">
              <p className="text-[10px] text-slate-500">کمترین باقی‌مانده (بانو)</p>
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
        </div>

        {isLoading || isFetching ? (
          <div className="flex justify-center py-12">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#4a6fa5]" />
          </div>
        ) : data?.days.length ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
            {data.days.map((day) => (
              <DayCapacityCard key={day.date} day={day} />
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
            {formatPersianNumber(countDaysInclusive(data.startDate, data.endDate))} روز — از{' '}
            {formatPersianDate(data.startDate)} تا {formatPersianDate(data.endDate)}
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
