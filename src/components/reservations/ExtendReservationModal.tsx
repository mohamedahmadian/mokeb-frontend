import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../Modal';
import { PersianDateInput, formatPersianDate } from '../ui/PersianDateInput';
import { formatPersianNumber } from '../../lib/capacity';
import {
  computeExtendedEndDate,
  currentReservationEndDate,
  defaultExtensionStayDays,
  EXTENSION_DAY_OPTIONS,
  isExtensionStayDaysAllowed,
  reservationStartDate,
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
  const startDate = useMemo(
    () => reservationStartDate(reservation),
    [reservation],
  );
  const currentEndDate = useMemo(
    () => currentReservationEndDate(reservation),
    [reservation],
  );
  const defaultStayDays = useMemo(
    () => defaultExtensionStayDays(reservation),
    [reservation],
  );
  const [selectedDays, setSelectedDays] = useState(defaultStayDays);
  const [newEndDate, setNewEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const applyDuration = (days: number) => {
    setSelectedDays(days);
    setNewEndDate(computeExtendedEndDate(currentEndDate, days));
  };

  useEffect(() => {
    if (!open) return;
    setSelectedDays(defaultStayDays);
    setNewEndDate(computeExtendedEndDate(currentEndDate, defaultStayDays));
  }, [open, currentEndDate, defaultStayDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(newEndDate);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="تمدید رزرو" size="md">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <p className="text-sm leading-relaxed text-slate-600">
          تاریخ پایان رزرو «{reservation.pilgrim.fullName} •{' '}
          {reservation.trackingCode}» تغییر می‌کند و ظرفیت موکب به‌روزرسانی
          می‌شود.
        </p>

        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">تاریخ شروع</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatPersianDate(startDate)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">تاریخ پایان فعلی</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatPersianDate(currentEndDate)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">مدت تمدید</p>
          <div className="flex gap-2">
            {EXTENSION_DAY_OPTIONS.map((days) => {
              const allowed = isExtensionStayDaysAllowed(reservation, days);
              const selected = selectedDays === days;
              return (
                <button
                  key={days}
                  type="button"
                  disabled={!allowed}
                  onClick={() => applyDuration(days)}
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

        <PersianDateInput
          label="تاریخ پایان جدید"
          value={newEndDate}
          onChange={(value) => {
            setNewEndDate(value);
            if (value >= currentEndDate) {
              const start = new Date(`${currentEndDate}T12:00:00`);
              const end = new Date(`${value}T12:00:00`);
              const diff = Math.round(
                (end.getTime() - start.getTime()) / 86_400_000,
              );
              if (diff >= 1 && diff <= 3) {
                setSelectedDays(diff);
              }
            }
          }}
          minDate={currentEndDate}
          portal
        />

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
