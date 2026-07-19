import { useEffect } from 'react';
import { Modal } from '../Modal';
import { NavIcon } from '../ui/NavIcons';
import { btnPrimary, btnSecondary } from '../../lib/styles';
import { ReservationSendSmsButton } from './ReservationSendSmsButton';
import type { Reservation } from '../../types';

interface QuickReservationSuccessModalProps {
  open: boolean;
  reservation: Reservation | null;
  onQuickReserveAgain: () => void;
  onViewPilgrimCard: () => void;
  onClose: () => void;
}

function IconViewCard() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

export function QuickReservationSuccessModal({
  open,
  reservation,
  onQuickReserveAgain,
  onViewPilgrimCard,
  onClose,
}: QuickReservationSuccessModalProps) {
  useEffect(() => {
    if (!open) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="رزرو با موفقیت ثبت شد"
      size="sm"
      mobilePlacement="top"
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-slate-600">
          رزرو سریع با موفقیت انجام شد.
          {reservation?.trackingCode ? (
            <>
              {' '}
              کد پیگیری:{' '}
              <span className="font-semibold text-slate-800" dir="ltr">
                {reservation.trackingCode}
              </span>
            </>
          ) : null}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onQuickReserveAgain}
            className={`${btnPrimary} w-full`}
          >
            <NavIcon name="quickReserve" className="h-4 w-4" />
            رزرو سریع مجدد
          </button>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <button
              type="button"
              onClick={onViewPilgrimCard}
              className={`${btnSecondary} w-full`}
            >
              <IconViewCard />
              نمایش زائر کارت
            </button>
            {reservation ? (
              <ReservationSendSmsButton
                reservation={reservation}
                className={`${btnSecondary} w-full`}
              />
            ) : null}
          </div>
        </div>
      </div>
    </Modal>
  );
}
