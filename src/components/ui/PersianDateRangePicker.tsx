import { useMemo } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import { formatPersianDate } from './PersianDateInput';
import { DatePickerClearWrap, withClearPadding } from './DatePickerClearWrap';
import { filterInputClass, inputClass } from '../../lib/styles';
import 'react-multi-date-picker/styles/colors/teal.css';

interface PersianDateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  label?: string;
  compact?: boolean;
  clearable?: boolean;
  minDate?: string;
}

function toGregorianString(date: DateObject): string {
  return date.convert(gregorian, gregorian_en).format('YYYY-MM-DD');
}

function fromGregorianString(value: string): DateObject {
  return new DateObject({ date: value, calendar: gregorian }).convert(
    persian,
    persian_fa,
  );
}

export function formatPersianDateRange(startDate: string, endDate: string): string {
  const start = fromGregorianString(startDate);
  const end = fromGregorianString(endDate);
  const startLabel = start.format('DD MMMM YYYY');
  if (startDate === endDate) return startLabel;

  const startYear = start.format('YYYY');
  const endYear = end.format('YYYY');
  if (startYear === endYear) {
    return `${start.format('DD MMMM')} الی ${end.format('DD MMMM YYYY')}`;
  }

  return `${startLabel} الی ${end.format('DD MMMM YYYY')}`;
}

export function PersianDateRangePicker({
  startDate,
  endDate,
  onChange,
  label = 'بازه تاریخ رزرو',
  compact = false,
  clearable = true,
  minDate,
}: PersianDateRangePickerProps) {
  const value = useMemo(() => {
    if (!startDate) return [];
    const start = fromGregorianString(startDate);
    if (!endDate || endDate === startDate) return [start];
    return [start, fromGregorianString(endDate)];
  }, [startDate, endDate]);

  const minDateValue = useMemo(
    () => (minDate ? fromGregorianString(minDate) : undefined),
    [minDate],
  );

  const hasValue = !!startDate;
  const baseInputClass = compact
    ? filterInputClass
    : `${inputClass} px-4 py-3`;
  const pickerInputClass = clearable
    ? withClearPadding(baseInputClass, hasValue)
    : baseInputClass;

  const picker = (
    <DatePicker
      range
      calendar={persian}
      locale={persian_fa}
      value={value}
      minDate={minDateValue}
      onChange={(dates) => {
        if (!dates || (Array.isArray(dates) && dates.length === 0)) {
          onChange('', '');
          return;
        }
        const selected = Array.isArray(dates) ? dates : [dates];
        if (selected.length === 0) {
          onChange('', '');
          return;
        }
        const start = toGregorianString(selected[0]);
        const end = selected[1] ? toGregorianString(selected[1]) : start;
        onChange(start, end);
      }}
      format="DD MMMM YYYY"
      numberOfMonths={1}
      containerClassName="w-full"
      inputClass={pickerInputClass}
      placeholder={compact ? 'از تاریخ — تا تاریخ' : 'انتخاب تاریخ شروع و پایان'}
      arrow={false}
      editable={false}
    />
  );

  return (
    <div>
      {!compact && (
        <span className="mb-1.5 block text-sm text-slate-600">{label}</span>
      )}
      {clearable ? (
        <DatePickerClearWrap
          hasValue={hasValue}
          onClear={() => onChange('', '')}
        >
          {picker}
        </DatePickerClearWrap>
      ) : (
        picker
      )}
      {!compact && startDate && (
        <p className="mt-1.5 text-xs text-slate-500">
          {formatPersianDateRange(startDate, endDate || startDate)}
        </p>
      )}
      {!compact && minDate && (
        <p className="mt-1 text-xs text-slate-400">
          حداقل تاریخ شروع: {formatPersianDate(minDate)}
        </p>
      )}
    </div>
  );
}
