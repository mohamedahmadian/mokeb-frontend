import { useState } from 'react';
import { NavIcon } from '../ui/NavIcons';
import { guestApi } from '../../lib/guest';
import { guestTheme } from '../../lib/guest-theme';
import { formatDateTimeFa } from '../../lib/format-time';
import { reservationsApi } from '../../lib/reservations';
import { btnPrimary, btnSecondary } from '../../lib/styles';
import { toast, toastApiError } from '../../lib/toast';
import type { Reservation } from '../../types';
import {
  ReservationAttendanceModal,
  type AttendanceMode,
  type AttendanceType,
} from './ReservationAttendanceModal';

interface ReservationCheckInOutProps {
  reservation: Reservation;
  variant: 'guest' | 'panel';
  onUpdate: (reservation: Reservation) => void;
}

type ModalState = {
  type: AttendanceType;
  mode: AttendanceMode;
} | null;

export function ReservationCheckInOut({
  reservation,
  variant,
  onUpdate,
}: ReservationCheckInOutProps) {
  const [loading, setLoading] = useState<'in' | 'out' | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const isGuest = variant === 'guest';
  const canEdit = !isGuest;

  if (
    reservation.status === 'Pending' ||
    reservation.status === 'Cancelled'
  ) {
    return null;
  }

  const hasCheckIn = !!reservation.actualCheckInAt;
  const hasCheckOut = !!reservation.actualCheckOutAt;
  const canCheckIn =
    reservation.status === 'Confirmed' && !hasCheckIn && !hasCheckOut;
  const canCheckOut =
    reservation.status === 'Confirmed' && hasCheckIn && !hasCheckOut;

  const checkoutDateBounds = {
    min: reservation.reservationDate.slice(0, 10),
    max: (reservation.reservationEndDate ?? reservation.reservationDate).slice(
      0,
      10,
    ),
  };

  const handleConfirm = async (recordedAt: string) => {
    if (!modal) return;

    const { type, mode } = modal;
    setLoading(type === 'check-in' ? 'in' : 'out');
    try {
      let updated: Reservation;

      if (mode === 'edit') {
        updated =
          type === 'check-in'
            ? await reservationsApi.updateCheckIn(reservation.id, recordedAt)
            : await reservationsApi.updateCheckOut(reservation.id, recordedAt);
      } else if (type === 'check-in') {
        updated = isGuest
          ? await guestApi.checkIn(reservation.trackingCode, recordedAt)
          : await reservationsApi.checkIn(reservation.id, recordedAt);
      } else {
        updated = isGuest
          ? await guestApi.checkOut(reservation.trackingCode, recordedAt)
          : await reservationsApi.checkOut(reservation.id, recordedAt);
      }

      onUpdate(updated);
      toast.success(
        mode === 'edit'
          ? type === 'check-in'
            ? 'ساعت ورود با موفقیت ویرایش شد'
            : 'ساعت خروج با موفقیت ویرایش شد'
          : type === 'check-in'
            ? 'ورود با موفقیت ثبت شد'
            : 'خروج با موفقیت ثبت شد',
      );
    } catch (err) {
      const action =
        mode === 'edit'
          ? type === 'check-in'
            ? 'خطا در ویرایش ورود'
            : 'خطا در ویرایش خروج'
          : type === 'check-in'
            ? 'خطا در ثبت ورود'
            : 'خطا در ثبت خروج';
      toastApiError(err, action);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  const cardClass = isGuest ? guestTheme.cardLg : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5';
  const primaryBtn = isGuest ? guestTheme.btnPrimaryLg : btnPrimary;
  const secondaryBtn = isGuest ? `${guestTheme.btnPrimaryLg} !bg-emerald-600 hover:!bg-emerald-700` : `${btnPrimary} !bg-emerald-600 hover:!bg-emerald-700`;
  const editBtn = `${btnSecondary} inline-flex items-center justify-center gap-1.5 !min-h-8 !px-2.5 !py-1.5 !text-xs`;

  return (
    <>
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
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-emerald-700">ورود ثبت‌شده</p>
                    <p className="mt-0.5 font-medium text-emerald-900">
                      {formatDateTimeFa(reservation.actualCheckInAt)}
                    </p>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setModal({ type: 'check-in', mode: 'edit' })}
                      disabled={loading !== null}
                      className={editBtn}
                    >
                      <NavIcon name="settings" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                      ویرایش
                    </button>
                  )}
                </div>
              </div>
            )}
            {hasCheckOut && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">خروج ثبت‌شده</p>
                    <p className="mt-0.5 font-medium text-slate-800">
                      {formatDateTimeFa(reservation.actualCheckOutAt)}
                    </p>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setModal({ type: 'check-out', mode: 'edit' })}
                      disabled={loading !== null}
                      className={editBtn}
                    >
                      <NavIcon name="settings" className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                      ویرایش
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {canCheckIn && (
            <button
              type="button"
              onClick={() => setModal({ type: 'check-in', mode: 'create' })}
              disabled={loading !== null}
              className={`${primaryBtn} inline-flex w-full items-center justify-center gap-2 sm:w-auto sm:min-w-[9rem]`}
            >
              <NavIcon name="login" className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {loading === 'in' ? 'در حال ثبت...' : 'ثبت ورود'}
            </button>
          )}

          {canCheckOut && (
            <button
              type="button"
              onClick={() => setModal({ type: 'check-out', mode: 'create' })}
              disabled={loading !== null}
              className={`${secondaryBtn} inline-flex w-full items-center justify-center gap-2 sm:w-auto sm:min-w-[9rem]`}
            >
              <NavIcon name="logout" className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {loading === 'out' ? 'در حال ثبت...' : 'ثبت خروج'}
            </button>
          )}

          {hasCheckOut && (
            <p className="text-center text-xs text-slate-500">
              این رزرو تکمیل شده است.
            </p>
          )}
        </div>
      </div>

      <ReservationAttendanceModal
        open={modal !== null}
        type={modal?.type ?? 'check-in'}
        mode={modal?.mode ?? 'create'}
        initialRecordedAt={
          modal?.type === 'check-in'
            ? reservation.actualCheckInAt
            : reservation.actualCheckOutAt
        }
        checkoutDateBounds={
          modal?.type === 'check-out' ? checkoutDateBounds : undefined
        }
        variant={variant}
        onClose={() => setModal(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
