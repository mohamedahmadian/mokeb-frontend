import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ReservationForm,
  type ReservationFormSuccess,
} from '../components/reservations/ReservationForm';
import { IconHome } from '../components/reservations/reservation-form-ui';

export function NewReservationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMawkibId = searchParams.get('mawkibId');
  const initialPilgrimUserId = searchParams.get('pilgrimUserId');
  const initialReservationDate = searchParams.get('date');

  const parsedMawkibId = initialMawkibId ? parseInt(initialMawkibId, 10) : null;
  const parsedPilgrimUserId = initialPilgrimUserId
    ? parseInt(initialPilgrimUserId, 10)
    : null;

  const handleSuccess = (result: ReservationFormSuccess) => {
    if (result.variant !== 'panel') return;
    navigate(`/reservations/${result.reservationId}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800 sm:mb-6 sm:text-2xl">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
          <IconHome />
        </span>
        رزرو موکب
      </h1>

      <ReservationForm
        variant="panel"
        initialMawkibId={parsedMawkibId}
        initialReservationDate={initialReservationDate}
        initialPilgrimUserId={parsedPilgrimUserId}
        onSuccess={handleSuccess}
        onCancel={() => navigate('/reservations')}
      />
    </div>
  );
}
