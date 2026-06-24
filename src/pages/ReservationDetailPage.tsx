import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { CancelReservationModal } from '../components/reservations/CancelReservationModal';
import { ReservationDetailInfo, ReservationStatusBanner } from '../components/reservations/ReservationDetailInfo';
import { ReservationTrackingHeader } from '../components/reservations/ReservationTrackingHeader';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../lib/constants';
import { reservationsApi } from '../lib/reservations';
import { btnAction, btnDanger, btnSecondary } from '../lib/styles';

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const reservationId = Number(id);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const isPilgrim =
    (user?.roles.includes('Pilgrim') ?? false) && !isAdmin && !isMawkibOwner;
  const canConfirm = isAdmin || isMawkibOwner;
  const [cancelOpen, setCancelOpen] = useState(false);

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
    },
  });

  const cancelReservation = useMutation({
    mutationFn: (note: string) => reservationsApi.cancel(reservationId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservation', reservationId] });
      queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
      setCancelOpen(false);
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

  const actions = (
    <>
      {reservation.status === 'Pending' && canConfirm && (
        <button
          type="button"
          onClick={() => updateStatus.mutate()}
          disabled={updateStatus.isPending}
          className={`${btnAction} bg-emerald-600 text-white hover:bg-emerald-700`}
        >
          تایید رزرو
        </button>
      )}
      {canCancel && (
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          className={`${btnDanger} !min-h-9 !px-2.5 !py-1.5 !text-xs`}
        >
          لغو رزرو
        </button>
      )}
    </>
  );

  const hasActions =
    (reservation.status === 'Pending' && canConfirm) || canCancel;

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

        <ReservationTrackingHeader trackingCode={reservation.trackingCode} copyable />
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
    </div>
  );
}
