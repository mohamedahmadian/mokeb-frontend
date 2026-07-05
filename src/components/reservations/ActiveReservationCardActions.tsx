import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NavIcon } from '../ui/NavIcons';
import { MawkibCardPrintButton } from '../mawkibs/MawkibCardPrintButton';
import { CancelReservationModal } from './CancelReservationModal';
import { PilgrimCardViewButton } from './PilgrimCardViewButton';
import { ReservationUserCardPrintButton } from './ReservationUserCardPrintButton';
import { reservationMawkibToCardData } from '../../lib/mawkib-card';
import { getApiErrorMessage } from '../../lib/constants';
import { canExtendReservation, extensionSuccessMessage } from '../../lib/reservation-extend';
import { reservationsApi } from '../../lib/reservations';
import { btnAction, btnPrimary } from '../../lib/styles';
import { toast, toastApiError } from '../../lib/toast';
import { useAuth } from '../../contexts/AuthContext';
import type { Reservation } from '../../types';

const dashboardActionBtn = `${btnAction} inline-flex shrink-0 items-center justify-center gap-1.5 border !min-h-8 !px-2.5 !py-1.5 !text-[11px]`;
const dashboardSecondaryBtn = `${dashboardActionBtn} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
const dashboardDangerBtn = `${btnPrimary} inline-flex shrink-0 items-center justify-center gap-1.5 !min-h-8 !px-2.5 !py-1.5 !text-[11px] !bg-red-600 hover:!bg-red-700`;

const iconClass = 'h-3.5 w-3.5 shrink-0';

function IconExtend() {
  return (
    <svg
      className={iconClass}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

interface ActiveReservationCardActionsProps {
  reservation: Reservation;
}

export function ActiveReservationCardActions({
  reservation,
}: ActiveReservationCardActionsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [cancelOpen, setCancelOpen] = useState(false);

  const canExtend = canExtendReservation(reservation);
  const canCancel =
    reservation.status !== 'Cancelled' &&
    reservation.status !== 'Completed' &&
    reservation.pilgrim.id === user?.id;

  const extendReservation = useMutation({
    mutationFn: () => reservationsApi.extend(reservation.id),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(extensionSuccessMessage(created.status));
      navigate(`/reservations/${created.id}`);
    },
    onError: (error) => {
      toastApiError(error, 'خطا در ثبت تمدید رزرو');
    },
  });

  const cancelReservation = useMutation({
    mutationFn: (note: string) => reservationsApi.cancel(reservation.id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['reservation', reservation.id] });
      setCancelOpen(false);
      toast.success('رزرو با موفقیت لغو شد');
    },
    onError: (error) => {
      toastApiError(error, 'خطا در لغو رزرو');
    },
  });

  return (
    <>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        <Link
          to={`/reservations/${reservation.id}`}
          className={dashboardSecondaryBtn}
        >
          <NavIcon name="info" className={iconClass} strokeWidth={1.75} />
          مشاهده جزئیات
        </Link>

        {canExtend && (
          <button
            type="button"
            onClick={() => extendReservation.mutate()}
            disabled={extendReservation.isPending}
            className={dashboardSecondaryBtn}
          >
            <IconExtend />
            {extendReservation.isPending ? 'در حال ثبت...' : 'تمدید رزرو'}
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            disabled={cancelReservation.isPending}
            className={dashboardDangerBtn}
          >
            <NavIcon name="x" className={iconClass} strokeWidth={2} />
            لغو رزرو
          </button>
        )}

        <PilgrimCardViewButton
          trackingCode={reservation.trackingCode}
          reservation={reservation}
          className={dashboardSecondaryBtn}
        />
        <ReservationUserCardPrintButton
          reservation={reservation}
          className={dashboardSecondaryBtn}
        />
        <MawkibCardPrintButton
          data={reservationMawkibToCardData(reservation.mawkib)}
          className={dashboardSecondaryBtn}
        />
      </div>

      <CancelReservationModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onSubmit={async (note) => {
          try {
            await cancelReservation.mutateAsync(note);
          } catch (err) {
            throw new Error(getApiErrorMessage(err, 'خطا در لغو رزرو'));
          }
        }}
      />
    </>
  );
}
