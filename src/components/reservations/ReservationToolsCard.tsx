import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { guestTheme } from '../../lib/guest-theme';
import { btnSecondary } from '../../lib/styles';
import type { Reservation } from '../../types';
import { ReservationDeliveredItemsButton } from './ReservationDeliveredItemsButton';
import { ReservationUserCardPrintButton } from './ReservationUserCardPrintButton';
import { MawkibCardPrintButton } from '../mawkibs/MawkibCardPrintButton';
import { reservationMawkibToCardData } from '../../lib/mawkib-card';

interface ReservationToolsCardProps {
  reservation: Reservation;
  variant: 'panel' | 'guest';
  reservationId?: number;
  onDeliveredItemsUpdate?: (reservation: Reservation) => void;
}

function ToolsCardShell({
  variant,
  children,
}: {
  variant: 'panel' | 'guest';
  children: ReactNode;
}) {
  const shellClass =
    variant === 'guest'
      ? `${guestTheme.card} p-4`
      : 'rounded-xl border border-slate-200 bg-white p-4 shadow-sm';

  return (
    <section className={shellClass} aria-label="ابزارهای رزرو">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">{children}</div>
    </section>
  );
}

export function ReservationToolsCard({
  reservation,
  variant,
  reservationId,
  onDeliveredItemsUpdate,
}: ReservationToolsCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const showDeliveredItems = variant === 'panel' && (isAdmin || isMawkibOwner);

  const buttonClass =
    variant === 'guest'
      ? `${guestTheme.btnSecondary} w-full`
      : `${btnSecondary} w-full sm:w-auto sm:min-w-[220px]`;

  return (
    <ToolsCardShell variant={variant}>
      {showDeliveredItems && reservationId != null && (
        <ReservationDeliveredItemsButton
          reservation={reservation}
          reservationId={reservationId}
          onUpdate={onDeliveredItemsUpdate}
          className={buttonClass}
        />
      )}
      <ReservationUserCardPrintButton
        reservation={reservation}
        className={buttonClass}
      />
      {variant === 'panel' && (isAdmin || isMawkibOwner) && (
        <MawkibCardPrintButton
          data={reservationMawkibToCardData(reservation.mawkib)}
          className={buttonClass}
        />
      )}
    </ToolsCardShell>
  );
}
