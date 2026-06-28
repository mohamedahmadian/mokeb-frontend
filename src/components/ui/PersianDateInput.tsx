import { useMemo } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import { DatePickerClearWrap, withClearPadding } from './DatePickerClearWrap';
import { filterInputClass } from '../../lib/styles';
import { formatTimeFromIso } from '../../lib/format-time';
import 'react-multi-date-picker/styles/colors/teal.css';

interface PersianDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
  label?: string;
  clearable?: boolean;
  minDate?: string;
  inputClassName?: string;
  disabled?: boolean;
}

function toGregorianString(date: DateObject): string {
  return date.convert(gregorian, gregorian_en).format('YYYY-MM-DD');
}

function fromGregorianString(value: string): DateObject | undefined {
  if (!value) return undefined;
  return new DateObject({ date: value, calendar: gregorian }).convert(
    persian,
    persian_fa,
  );
}

/** استخراج تاریخ میلادی YYYY-MM-DD بر اساس timezone محلی مرورگر */
export function toLocalGregorianDateString(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatPersianDate(value: string): string {
  const date = fromGregorianString(value);
  return date ? date.format('DD MMMM YYYY') : '—';
}

/** تبدیل ISO datetime به تاریخ شمسی با در نظر گرفتن timezone محلی */
export function formatPersianDateFromIso(value: string): string {
  return formatPersianDate(toLocalGregorianDateString(value));
}

/** تاریخ شمسی + ساعت محلی از ISO */
export function formatPersianDateTimeFromIso(value?: string | null): string {
  if (!value) return '—';
  const datePart = formatPersianDateFromIso(value);
  const timePart = formatTimeFromIso(value);
  if (datePart === '—') return '—';
  return timePart ? `${datePart}، ساعت ${timePart}` : datePart;
}

export function PersianDateInput({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  compact = false,
  label,
  clearable = true,
  minDate,
  inputClassName,
  disabled = false,
}: PersianDateInputProps) {
  const pickerValue = fromGregorianString(value);
  const baseInputClass = inputClassName ?? filterInputClass;
  const inputClass = clearable ? withClearPadding(baseInputClass, !!value) : baseInputClass;

  const minDateValue = useMemo(
    () => (minDate ? fromGregorianString(minDate) : undefined),
    [minDate],
  );

  const picker = (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      value={pickerValue}
      minDate={minDateValue}
      disabled={disabled}
      onChange={(date) => {
        if (!date || Array.isArray(date)) {
          onChange('');
          return;
        }
        onChange(toGregorianString(date));
      }}
      format="DD MMMM YYYY"
      containerClassName="w-full"
      inputClass={inputClass}
      placeholder={placeholder}
      arrow={false}
      editable={false}
    />
  );

  return (
    <div className={compact ? undefined : 'block'}>
      {label && !compact && (
        <span className="mb-1 block text-sm text-slate-600">{label}</span>
      )}
      {clearable && !disabled ? (
        <DatePickerClearWrap hasValue={!!value} onClear={() => onChange('')}>
          {picker}
        </DatePickerClearWrap>
      ) : (
        picker
      )}
    </div>
  );
}
