import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../Modal';
import { formatPersianDateRange } from '../ui/PersianDateRangePicker';
import { formatPersianNumber } from '../../lib/capacity';
import {
  computeExtensionEndDateForStayDays,
  computeExtensionStartDate,
  defaultExtensionStayDays,
  EXTENSION_DAY_OPTIONS,
  isExtensionStayDaysAllowed,
} from '../../lib/reservation-extend';
import { btnPrimary, btnSecondary } from '../../lib/styles';
import type { Reservation } from '../../types';

interface ExtendReservationModalProps {
  open: boolean;
  reservation: Reservation;
  onClose: () => void;
  onSubmit: (reservationEndDate: string) => Promise<void>;
}

const dayOptionClass = (selected: boolean) =>
  `inline-flex flex-1 min-w-0 items-center justify-center rounded-xl border px-3 py-3 text-sm font-semibold transition ${
    selected
      ? 'border-[#4a6fa5] bg-[#f0f4fa] text-[#4a6fa5] shadow-sm ring-2 ring-[#4a6fa5]/20'
      : 'border-slate-200 bg-white text-slate-700 hover:border-[#c5d4e8] hover:bg-slate-50'
  }`;

export function ExtendReservationModal({
  open,
  reservation,
  onClose,
  onSubmit,
}: ExtendReservationModalProps) {
  const extensionStart = useMemo(
    () => computeExtensionStartDate(reservation),
    [reservation],
  );
  const defaultStayDays = useMemo(
    () => defaultExtensionStayDays(reservation),
    [reservation],
  );
  const [selectedDays, setSelectedDays] = useState(defaultStayDays);
  const [loading, setLoading] = useState(false);

  const extensionEnd = useMemo(
    () => computeExtensionEndDateForStayDays(extensionStart, selectedDays),
    [extensionStart, selectedDays],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedDays(defaultStayDays);
  }, [open, defaultStayDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(extensionEnd);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="تمدید رزرو" size="md">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <p className="text-sm leading-relaxed text-slate-600">
          رزرو جدیدی با همان مشخصات زائر در وضعیت «در انتظار» ثبت می‌شود و پس از
          تایید موکب‌دار قطعی خواهد شد.
        </p>

        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
          <p className="text-xs font-medium text-slate-500">بازه اقامت تمدید</p>
          <p className="mt-2 text-base font-bold text-slate-800">
            {formatPersianDateRange(extensionStart, extensionEnd)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            از تاریخ پایان رزرو فعلی (
            {(reservation.reservationEndDate ?? reservation.reservationDate).slice(0, 10)})
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">مدت اقامت</p>
          <div className="flex gap-2">
            {EXTENSION_DAY_OPTIONS.map((days) => {
              const allowed = isExtensionStayDaysAllowed(reservation, days);
              const selected = selectedDays === days;
              return (
                <button
                  key={days}
                  type="button"
                  disabled={!allowed}
                  onClick={() => setSelectedDays(days)}
                  className={`${dayOptionClass(selected)} ${!allowed ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  {formatPersianNumber(days)} روز
                </button>
              );
            })}
          </div>
          {!isExtensionStayDaysAllowed(reservation, 3) && (
            <p className="text-xs text-amber-700">
              حداکثر مدت رزرو این موکب اجازه انتخاب برخی گزینه‌ها را نمی‌دهد.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={btnSecondary}
          >
            انصراف
          </button>
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? 'در حال ثبت...' : 'ثبت تمدید'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
