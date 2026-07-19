import { buildQuickReservationSmsHref } from '../../lib/reservation-track';
import { toast } from '../../lib/toast';
import type { Reservation } from '../../types';

function IconSendSms({ className = 'h-4 w-4 shrink-0' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.6}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  );
}

interface ReservationSendSmsButtonProps {
  reservation: Reservation;
  className?: string;
  iconClassName?: string;
}

export function ReservationSendSmsButton({
  reservation,
  className,
  iconClassName,
}: ReservationSendSmsButtonProps) {
  const smsHref = buildQuickReservationSmsHref({
    ...reservation,
    pilgrimMobile:
      reservation.pilgrimMobile || reservation.pilgrim?.mobileNumber,
  });

  const handleSendSms = () => {
    if (!smsHref) {
      toast.error('شماره موبایل زائر برای ارسال پیامک معتبر نیست');
      return;
    }
    window.location.href = smsHref;
  };

  const icon = <IconSendSms className={iconClassName} />;

  if (smsHref) {
    return (
      <a href={smsHref} className={className}>
        {icon}
        ارسال پیامک
      </a>
    );
  }

  return (
    <button type="button" onClick={handleSendSms} className={className}>
      {icon}
      ارسال پیامک
    </button>
  );
}
