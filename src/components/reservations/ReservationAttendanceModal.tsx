import { useEffect, useRef, useState } from 'react';
import { Modal } from '../Modal';
import { NavIcon } from '../ui/NavIcons';
import { PersianDateInput } from '../ui/PersianDateInput';
import {
  buildRecordedAtFromDateAndTime,
  buildRecordedAtFromTime,
  clampDateString,
  currentTimeInputValue,
  dateInputValueFromIso,
  formatLiveClockFa,
  timeInputValueFromIso,
  todayLocalGregorianDateString,
} from '../../lib/format-time';
import { btnPrimary, inputClass } from '../../lib/styles';
import { guestTheme } from '../../lib/guest-theme';

export type AttendanceType = 'check-in' | 'check-out';
export type AttendanceMode = 'create' | 'edit';

export interface CheckoutDateBounds {
  min: string;
  max: string;
}

interface ReservationAttendanceModalProps {
  open: boolean;
  type: AttendanceType;
  mode?: AttendanceMode;
  initialRecordedAt?: string | null;
  checkoutDateBounds?: CheckoutDateBounds;
  onClose: () => void;
  onConfirm: (recordedAt: string) => Promise<void>;
  variant?: 'guest' | 'panel';
}

const config: Record<
  AttendanceType,
  {
    title: string;
    editTitle: string;
    description: string;
    editDescription: string;
    icon: 'login' | 'logout';
    iconBg: string;
    iconColor: string;
    submitLabel: string;
    editSubmitLabel: string;
    submitClass: string;
  }
> = {
  'check-in': {
    title: 'ثبت ورود',
    editTitle: 'ویرایش ساعت ورود',
    description: 'ساعت فعلی سیستم را بررسی کنید یا در صورت نیاز ساعت ثبت را تغییر دهید.',
    editDescription: 'ساعت ثبت‌شده را بررسی کنید یا در صورت نیاز اصلاح کنید.',
    icon: 'login',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    submitLabel: 'ثبت ورود',
    editSubmitLabel: 'ذخیره ورود',
    submitClass: `${btnPrimary} !bg-emerald-600 hover:!bg-emerald-700`,
  },
  'check-out': {
    title: 'ثبت خروج',
    editTitle: 'ویرایش خروج',
    description:
      'تاریخ پایان اقامت و ساعت خروج را مشخص کنید. ظرفیت شب‌های بعد از این تاریخ آزاد می‌شود.',
    editDescription:
      'تاریخ پایان اقامت و ساعت خروج را بررسی کنید یا در صورت نیاز اصلاح کنید.',
    icon: 'logout',
    iconBg: 'bg-[#e8eef6]',
    iconColor: 'text-[#4a6fa5]',
    submitLabel: 'ثبت خروج و اتمام اقامت',
    editSubmitLabel: 'ذخیره خروج',
    submitClass: btnPrimary,
  },
};

function defaultCheckoutDate(bounds: CheckoutDateBounds): string {
  const today = todayLocalGregorianDateString();
  return clampDateString(today, bounds.min, bounds.max);
}

export function ReservationAttendanceModal({
  open,
  type,
  mode = 'create',
  initialRecordedAt,
  checkoutDateBounds,
  onClose,
  onConfirm,
  variant = 'panel',
}: ReservationAttendanceModalProps) {
  const [liveNow, setLiveNow] = useState(() => new Date());
  const [timeValue, setTimeValue] = useState(() => currentTimeInputValue());
  const [checkoutDate, setCheckoutDate] = useState('');
  const [loading, setLoading] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);
  const cfg = config[type];
  const isGuest = variant === 'guest';
  const isEdit = mode === 'edit';
  const isCheckout = type === 'check-out';
  const submitBtnClass = isGuest ? guestTheme.btnPrimaryLg : cfg.submitClass;
  const modalTitle = isEdit ? cfg.editTitle : cfg.title;
  const modalDescription = isEdit ? cfg.editDescription : cfg.description;
  const submitLabel = isEdit ? cfg.editSubmitLabel : cfg.submitLabel;

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    setLiveNow(now);
    if (isEdit && initialRecordedAt) {
      setTimeValue(timeInputValueFromIso(initialRecordedAt));
      if (isCheckout) {
        setCheckoutDate(dateInputValueFromIso(initialRecordedAt));
      }
    } else {
      setTimeValue(currentTimeInputValue(now));
      if (isCheckout && checkoutDateBounds) {
        setCheckoutDate(defaultCheckoutDate(checkoutDateBounds));
      }
    }
  }, [open, type, mode, initialRecordedAt, isEdit, isCheckout, checkoutDateBounds]);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setLiveNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const frameId = window.requestAnimationFrame(() => {
      submitRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [open, type, mode]);

  const syncToNow = () => {
    const now = new Date();
    setLiveNow(now);
    setTimeValue(currentTimeInputValue(now));
    if (isCheckout && checkoutDateBounds) {
      setCheckoutDate(defaultCheckoutDate(checkoutDateBounds));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let recordedAt: string;

      if (isCheckout && checkoutDateBounds) {
        recordedAt = buildRecordedAtFromDateAndTime(checkoutDate, timeValue);
      } else {
        const baseDate =
          isEdit && initialRecordedAt ? new Date(initialRecordedAt) : new Date();
        recordedAt = buildRecordedAtFromTime(timeValue, baseDate);
      }

      await onConfirm(recordedAt);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cfg.iconBg} ${cfg.iconColor}`}
          >
            <NavIcon name={cfg.icon} className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <p className="pt-1 text-sm leading-relaxed text-slate-600">{modalDescription}</p>
        </div>

        {isCheckout && checkoutDateBounds && (
          <div className="space-y-2">
            <PersianDateInput
              label="تاریخ پایان اقامت"
              value={checkoutDate}
              onChange={setCheckoutDate}
              minDate={checkoutDateBounds.min}
              maxDate={checkoutDateBounds.max}
              inputClassName={isGuest ? guestTheme.input : inputClass}
            />
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-4 text-center shadow-sm">
          <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
            <NavIcon name="track" className="h-3.5 w-3.5" strokeWidth={1.75} />
            ساعت فعلی سیستم
          </p>
          <p
            className="text-3xl font-bold tracking-wide text-slate-800 sm:text-4xl"
            dir="ltr"
          >
            {formatLiveClockFa(liveNow)}
          </p>
        </div>

        <div className="space-y-2">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <NavIcon name="reserve" className="h-4 w-4 text-[#4a6fa5]" strokeWidth={1.75} />
              {isCheckout ? 'ساعت خروج' : 'ساعت ثبت'}
            </span>
            <input
              type="time"
              value={timeValue}
              onChange={(e) => setTimeValue(e.target.value)}
              className={`${isGuest ? guestTheme.input : inputClass} font-mono text-base font-semibold`}
              dir="ltr"
              required
            />
          </label>
          <button
            type="button"
            onClick={syncToNow}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4a6fa5] transition hover:text-[#3d5d8a] disabled:opacity-50"
          >
            <NavIcon name="check" className="h-3.5 w-3.5" strokeWidth={1.75} />
            استفاده از ساعت فعلی
          </button>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            ref={submitRef}
            type="submit"
            disabled={
              loading ||
              !timeValue ||
              (isCheckout && checkoutDateBounds ? !checkoutDate : false)
            }
            className={`${submitBtnClass} inline-flex items-center justify-center gap-2 !min-h-10 px-5 py-2.5 text-sm disabled:opacity-50`}
          >
            <NavIcon name={cfg.icon} className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {loading ? 'در حال ذخیره...' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
