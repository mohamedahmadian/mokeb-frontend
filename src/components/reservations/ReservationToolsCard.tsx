import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { guestTheme } from '../../lib/guest-theme';
import { btnSecondary } from '../../lib/styles';
import type { Reservation } from '../../types';
import { ReservationDeliveredItemsButton } from './ReservationDeliveredItemsButton';
import { ReservationMealPlanLink } from './ReservationMealPlanLink';
import { PilgrimCardViewButton } from './PilgrimCardViewButton';
import { PilgrimCardDownloadButton } from './PilgrimCardDownloadButton';
import { ReservationUserCardPrintButton } from './ReservationUserCardPrintButton';

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
      <div
        className={
          variant === 'panel'
            ? 'flex flex-col gap-2.5'
            : 'flex flex-col gap-2.5 sm:flex-row sm:flex-wrap'
        }
      >
        {children}
      </div>
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
  const showMealPlanLink = showDeliveredItems;

  const buttonClass =
    variant === 'guest'
      ? `${guestTheme.btnSecondary} w-full sm:w-auto`
      : `${btnSecondary} w-full min-w-0 !px-2 !py-2 !text-xs sm:!text-sm`;

  const pilgrimCardsRowClass =
    variant === 'panel'
      ? 'grid w-full grid-cols-3 gap-2'
      : 'flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap';

  return (
    <ToolsCardShell variant={variant}>
      {showDeliveredItems && reservationId != null && (
        <div className="flex w-full flex-wrap gap-2">
          <ReservationDeliveredItemsButton
            reservation={reservation}
            reservationId={reservationId}
            onUpdate={onDeliveredItemsUpdate}
            className={`${buttonClass} min-w-0 flex-1 sm:flex-none`}
          />
          {showMealPlanLink && (
            <ReservationMealPlanLink
              reservation={reservation}
              isAdmin={isAdmin}
              isMawkibOwner={isMawkibOwner}
              className={`${buttonClass} min-w-0 flex-1 sm:flex-none`}
            />
          )}
        </div>
      )}
      <div className={pilgrimCardsRowClass}>
        <PilgrimCardDownloadButton
          reservation={reservation}
          className={buttonClass}
        />
        <PilgrimCardViewButton
          trackingCode={reservation.trackingCode}
          reservation={reservation}
          presentation="modal"
          className={buttonClass}
        />
        <ReservationUserCardPrintButton
          reservation={reservation}
          className={buttonClass}
        />
      </div>
    </ToolsCardShell>
  );
}
