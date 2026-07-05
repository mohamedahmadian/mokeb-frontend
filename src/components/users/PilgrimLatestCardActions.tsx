import { useQuery } from '@tanstack/react-query';
import { PilgrimCardViewButton } from '../reservations/PilgrimCardViewButton';
import { ReservationUserCardPrintButton } from '../reservations/ReservationUserCardPrintButton';
import { reservationsApi } from '../../lib/reservations';
import { btnSecondary } from '../../lib/styles';

interface PilgrimLatestCardActionsProps {
  pilgrimUserId: number;
  ownerScope?: boolean;
  className?: string;
}

const actionBtnClass = `${btnSecondary} inline-flex w-full items-center justify-center gap-1.5 border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6] sm:w-auto`;

export function PilgrimLatestCardActions({
  pilgrimUserId,
  ownerScope = false,
  className,
}: PilgrimLatestCardActionsProps) {
  const { data: reservation, isLoading, isError } = useQuery({
    queryKey: ['pilgrim-latest-card', pilgrimUserId, ownerScope],
    queryFn: () =>
      reservationsApi.getLatestForPilgrimCard(pilgrimUserId, ownerScope),
    enabled: pilgrimUserId > 0,
  });

  const wrapperClass =
    className ?? 'flex w-full flex-col gap-2 sm:mr-auto sm:w-auto sm:flex-row';

  if (isLoading) {
    return (
      <div className={wrapperClass}>
        <button type="button" disabled className={`${actionBtnClass} opacity-60`}>
          در حال بارگذاری...
        </button>
      </div>
    );
  }

  const noReservation = isError || !reservation;
  const disabledTitle = 'رزروی فعالی برای زائر کارت یافت نشد';

  return (
    <div className={wrapperClass}>
      <PilgrimCardViewButton
        trackingCode={reservation?.trackingCode ?? ''}
        reservation={reservation ?? null}
        disabled={noReservation}
        title={noReservation ? disabledTitle : undefined}
        className={actionBtnClass}
      />
      {noReservation ? (
        <button
          type="button"
          disabled
          title={disabledTitle}
          className={`${actionBtnClass} cursor-not-allowed opacity-50`}
        >
          چاپ زائر کارت
        </button>
      ) : (
        <ReservationUserCardPrintButton
          reservation={reservation}
          className={actionBtnClass}
        />
      )}
    </div>
  );
}
