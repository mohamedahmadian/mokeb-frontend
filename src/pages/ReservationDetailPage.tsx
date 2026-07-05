import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CancelReservationModal } from '../components/reservations/CancelReservationModal';
import { ExtendReservationModal } from '../components/reservations/ExtendReservationModal';
import { ReservationCheckInOut } from '../components/reservations/ReservationCheckInOut';
import { ReservationDetailInfo, ReservationStatusBanner } from '../components/reservations/ReservationDetailInfo';
import { ReservationReviewSection } from '../components/reservations/ReservationReviewSection';
import { ReservationToolsCard } from '../components/reservations/ReservationToolsCard';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../lib/constants';
import { canExtendReservation, extensionSuccessMessage } from '../lib/reservation-extend';
import { toast, toastApiError } from '../lib/toast';
import { reservationsApi } from '../lib/reservations';
import { btnAction, btnDanger, btnPrimary, btnSecondary } from '../lib/styles';

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const reservationId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const isPilgrim =
    (user?.roles.includes('Pilgrim') ?? false) && !isAdmin && !isMawkibOwner;
  const canConfirm = isAdmin || isMawkibOwner;
  const [cancelOpen, setCancelOpen] = useState(false);
  const [extendOpen, setExtendOpen] = useState(false);

  const { data: reservation, isLoading, isError } = useQuery({
    queryKey: ['reservation', reservationId],
    queryFn: () => reservationsApi.getOne(reservationId),
    enabled: !!reservationId,
  });

  const updateStatus = useMutation({
    mutationFn: () => reservationsApi.updateStatus(reservationId, 'Confirmed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
      toast.success('رزرو با موفقیت تایید شد');
    },
    onError: (error) => {
      toastApiError(error, 'خطا در تایید رزرو');
    },
  });

  const cancelReservation = useMutation({
    mutationFn: (note: string) => reservationsApi.cancel(reservationId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
      setCancelOpen(false);
      toast.success('رزرو با موفقیت لغو شد');
    },
    onError: (error) => {
      toastApiError(error, 'خطا در لغو رزرو');
    },
  });

  const extendReservation = useMutation({
    mutationFn: (payload?: { reservationEndDate?: string; stayDays?: number }) =>
      reservationsApi.extend(reservationId, payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(extensionSuccessMessage(created.status));
      navigate(`/reservations/${created.id}`);
    },
    onError: (error) => {
      toastApiError(error, 'خطا در ثبت تمدید رزرو');
    },
  });

  if (!reservationId) {
    return <p className="text-red-600">شناسه رزرو نامعتبر است</p>;
  }

  if (isLoading) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  if (isError || !reservation) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">رزرو یافت نشد یا دسترسی ندارید.</p>
        <Link to="/reservations" className={btnSecondary}>
          بازگشت به لیست
        </Link>
      </div>
    );
  }

  const canCancel =
    reservation.status !== 'Cancelled' &&
    reservation.status !== 'Completed' &&
    (isAdmin ||
      isMawkibOwner ||
      (isPilgrim && reservation.pilgrim.id === user?.id));

  const showConfirm = reservation.status === 'Pending' && canConfirm;
  const canExtend = canExtendReservation(reservation);
  const showExtendModal = canExtend && !isPilgrim;

  const extendButtonClass = `${btnAction} inline-flex items-center gap-1.5 border border-[#c5d4e8] bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6] !min-h-9 !px-2.5 !py-1.5 !text-xs`;

  const handlePilgrimExtend = () => {
    extendReservation.mutate({});
  };

  const actions = (
    <div className="flex w-full flex-wrap items-center gap-2 justify-end">
      {showConfirm && (
        <button
          type="button"
          onClick={() => updateStatus.mutate()}
          disabled={updateStatus.isPending}
          className={`${btnAction} ${btnPrimary} !min-h-9 !px-2.5 !py-1.5 !text-xs`}
        >
          تایید رزرو
        </button>
      )}
      {canExtend && (
        <button
          type="button"
          onClick={() =>
            isPilgrim ? handlePilgrimExtend() : setExtendOpen(true)
          }
          disabled={extendReservation.isPending}
          className={extendButtonClass}
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {extendReservation.isPending ? 'در حال ثبت...' : 'تمدید رزرو'}
        </button>
      )}
      {canCancel && (
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          className={`${btnDanger} inline-flex items-center gap-1.5 !min-h-9 !px-2.5 !py-1.5 !text-xs`}
        >
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          لغو رزرو
        </button>
      )}
    </div>
  );

  const hasActions = showConfirm || canCancel || canExtend;

  return (
    <div className="mx-auto w-full max-w-xl">
      <PageHeader
        title="جزئیات رزرو"
        subtitle={reservation.mawkib.name}
        action={
          <Link to="/reservations" className={`${btnSecondary} w-full sm:w-auto`}>
            بازگشت
          </Link>
        }
      />

      <div className="space-y-4">
        <ReservationStatusBanner reservation={reservation} />

        <ReservationDetailInfo
          reservation={reservation}
          showStatusBanner={false}
          actions={hasActions ? actions : undefined}
        />

        {(isAdmin || isMawkibOwner) && (
          <ReservationCheckInOut
            reservation={reservation}
            variant="panel"
            onUpdate={(updated) => {
              queryClient.setQueryData(['reservation', reservationId], updated);
              queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
              queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
            }}
          />
        )}

        <ReservationToolsCard
          reservation={reservation}
          reservationId={reservationId}
          variant="panel"
          onDeliveredItemsUpdate={(updated) => {
            queryClient.setQueryData(['reservation', reservationId], updated);
            queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
            queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
          }}
        />

        <ReservationReviewSection
          reservation={reservation}
          reservationId={reservationId}
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

      {showExtendModal && (
        <ExtendReservationModal
          open={extendOpen}
          reservation={reservation}
          onClose={() => setExtendOpen(false)}
          onSubmit={async (reservationEndDate) => {
            await extendReservation.mutateAsync({ reservationEndDate });
          }}
        />
      )}
    </div>
  );
}
