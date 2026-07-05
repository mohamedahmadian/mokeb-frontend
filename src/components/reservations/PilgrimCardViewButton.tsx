import { useState } from 'react';
import { Link } from 'react-router-dom';
import { pilgrimCardPath } from '../../lib/reservation-track';
import { btnSecondary } from '../../lib/styles';
import type { Reservation } from '../../types';
import { PilgrimCardModal } from './PilgrimCardModal';

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

interface PilgrimCardViewButtonProps {
  trackingCode: string;
  reservation?: Reservation | null;
  className?: string;
  disabled?: boolean;
  title?: string;
  /** در پنل ادمین: مودال؛ در بخش مهمان: هدایت به صفحه عمومی */
  presentation?: 'modal' | 'link';
}

export function PilgrimCardViewButton({
  trackingCode,
  reservation = null,
  className,
  disabled = false,
  title,
  presentation = 'modal',
}: PilgrimCardViewButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const buttonClass =
    className ??
    `${btnSecondary} inline-flex w-full items-center justify-center gap-1.5 sm:w-auto`;

  if (disabled || !trackingCode.trim()) {
    return (
      <button
        type="button"
        disabled
        title={title ?? 'شناسه رزرو موجود نیست'}
        className={`${buttonClass} cursor-not-allowed opacity-50`}
      >
        <IconViewCard />
        نمایش زائر کارت
      </button>
    );
  }

  if (presentation === 'link') {
    return (
      <Link
        to={pilgrimCardPath(trackingCode)}
        title={title}
        className={buttonClass}
      >
        <IconViewCard />
        نمایش زائر کارت
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        title={title}
        className={buttonClass}
        onClick={() => setModalOpen(true)}
      >
        <IconViewCard />
        نمایش زائر کارت
      </button>
      <PilgrimCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reservation={reservation}
      />
    </>
  );
}
