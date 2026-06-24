import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import gregorian from 'react-date-object/calendars/gregorian';
import gregorian_en from 'react-date-object/locales/gregorian_en';
import { DatePickerClearWrap, withClearPadding } from './DatePickerClearWrap';
import { filterInputClass } from '../../lib/styles';
import 'react-multi-date-picker/styles/colors/teal.css';

interface PersianDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  compact?: boolean;
  label?: string;
  clearable?: boolean;
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

export function formatPersianDate(value: string): string {
  const date = fromGregorianString(value);
  return date ? date.format('DD MMMM YYYY') : '—';
}

export function PersianDateInput({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  compact = false,
  label,
  clearable = true,
}: PersianDateInputProps) {
  const pickerValue = fromGregorianString(value);
  const baseInputClass = filterInputClass;
  const inputClass = clearable ? withClearPadding(baseInputClass, !!value) : baseInputClass;

  const picker = (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      value={pickerValue}
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
      {clearable ? (
        <DatePickerClearWrap hasValue={!!value} onClear={() => onChange('')}>
          {picker}
        </DatePickerClearWrap>
      ) : (
        picker
      )}
    </div>
  );
}
