import { useEffect, useState } from 'react';
import { guestApi } from '../../lib/guest';
import { guestTheme } from '../../lib/guest-theme';
import { formatDateTimeFa } from '../../lib/format-time';
import { reservationsApi } from '../../lib/reservations';
import { btnPrimary } from '../../lib/styles';
import { toast, toastApiError } from '../../lib/toast';
import type { Reservation } from '../../types';

interface ReservationCheckInOutProps {
  reservation: Reservation;
  variant: 'guest' | 'panel';
  onUpdate: (reservation: Reservation) => void;
}

function LiveClockBox({ className = '' }: { className?: string }) {
  const [now, setNow] = useState(() =>
    new Date().toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(
        new Date().toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={`flex min-w-[7.5rem] items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm text-slate-700 shadow-sm ${className}`}
      dir="ltr"
    >
      {now}
    </div>
  );
}

export function ReservationCheckInOut({
  reservation,
  variant,
  onUpdate,
}: ReservationCheckInOutProps) {
  const [loading, setLoading] = useState<'in' | 'out' | null>(null);
  const isGuest = variant === 'guest';

  if (
    reservation.status === 'Pending' ||
    reservation.status === 'Cancelled'
  ) {
    return null;
  }

  const hasCheckIn = !!reservation.actualCheckInAt;
  const hasCheckOut = !!reservation.actualCheckOutAt;
  const canCheckIn = !hasCheckIn && !hasCheckOut;
  const canCheckOut = hasCheckIn && !hasCheckOut;

  const handleCheckIn = async () => {
    setLoading('in');
    try {
      const updated = isGuest
        ? await guestApi.checkIn(reservation.trackingCode)
        : await reservationsApi.checkIn(reservation.id);
      onUpdate(updated);
      toast.success('ورود با موفقیت ثبت شد');
    } catch (err) {
      toastApiError(err, 'خطا در ثبت ورود');
    } finally {
      setLoading(null);
    }
  };

  const handleCheckOut = async () => {
    setLoading('out');
    try {
      const updated = isGuest
        ? await guestApi.checkOut(reservation.trackingCode)
        : await reservationsApi.checkOut(reservation.id);
      onUpdate(updated);
      toast.success('خروج با موفقیت ثبت شد');
    } catch (err) {
      toastApiError(err, 'خطا در ثبت خروج');
    } finally {
      setLoading(null);
    }
  };

  const cardClass = isGuest ? guestTheme.cardLg : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5';
  const primaryBtn = isGuest ? guestTheme.btnPrimaryLg : btnPrimary;
  const secondaryBtn = isGuest ? `${guestTheme.btnPrimaryLg} !bg-emerald-600 hover:!bg-emerald-700` : `${btnPrimary} !bg-emerald-600 hover:!bg-emerald-700`;

  return (
    <div className={cardClass}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">ثبت ورود و خروج</h3>
        <p className="mt-1 text-xs text-slate-500">
          با ثبت ورود و خروج، زمان واقعی اقامت در سیستم ثبت می‌شود.
        </p>
      </div>

      {(hasCheckIn || hasCheckOut) && (
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {hasCheckIn && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2.5 text-sm">
              <p className="text-xs text-emerald-700">ورود ثبت‌شده</p>
              <p className="mt-0.5 font-medium text-emerald-900">
                {formatDateTimeFa(reservation.actualCheckInAt)}
              </p>
            </div>
          )}
          {hasCheckOut && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
              <p className="text-xs text-slate-500">خروج ثبت‌شده</p>
              <p className="mt-0.5 font-medium text-slate-800">
                {formatDateTimeFa(reservation.actualCheckOutAt)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {canCheckIn && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-slate-600">ساعت ورود:</span>
              <LiveClockBox />
            </div>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={loading !== null}
              className={`${primaryBtn} w-full sm:w-auto sm:min-w-[9rem]`}
            >
              {loading === 'in' ? 'در حال ثبت...' : 'ثبت ورود'}
            </button>
          </div>
        )}

        {canCheckOut && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-slate-600">ساعت خروج:</span>
              <LiveClockBox />
            </div>
            <button
              type="button"
              onClick={handleCheckOut}
              disabled={loading !== null}
              className={`${secondaryBtn} w-full sm:w-auto sm:min-w-[9rem]`}
            >
              {loading === 'out' ? 'در حال ثبت...' : 'ثبت خروج'}
            </button>
          </div>
        )}

        {hasCheckOut && (
          <p className="text-center text-xs text-slate-500">
            این رزرو تکمیل شده است.
          </p>
        )}
      </div>
    </div>
  );
}
