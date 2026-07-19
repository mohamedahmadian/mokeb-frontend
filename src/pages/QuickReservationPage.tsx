import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { QuickReservationForm } from '../components/reservations/QuickReservationForm';
import { QuickReservationSuccessModal } from '../components/reservations/QuickReservationSuccessModal';
import { PilgrimCardModal } from '../components/reservations/PilgrimCardModal';
import { NavIcon } from '../components/ui/NavIcons';
import type { Reservation } from '../types';

export function QuickReservationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formKey, setFormKey] = useState(0);
  const [completedReservation, setCompletedReservation] =
    useState<Reservation | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [pilgrimCardOpen, setPilgrimCardOpen] = useState(false);
  const [mobileFocusTrigger, setMobileFocusTrigger] = useState(0);
  const mawkibIdParam = searchParams.get('mawkibId');
  const mawkibId = mawkibIdParam ? parseInt(mawkibIdParam, 10) : NaN;

  if (!mawkibIdParam || Number.isNaN(mawkibId) || mawkibId <= 0) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleQuickReserveAgain = () => {
    setSuccessModalOpen(false);
    setPilgrimCardOpen(false);
    setCompletedReservation(null);
    setMobileFocusTrigger((current) => current + 1);
  };

  const handleViewPilgrimCard = () => {
    setPilgrimCardOpen(true);
  };

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    setPilgrimCardOpen(false);
    setCompletedReservation(null);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800 sm:mb-6 sm:text-2xl">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
          <NavIcon name="todayReserve" className="h-5 w-5" />
        </span>
        رزرو سریع
      </h1>

      <QuickReservationForm
        key={formKey}
        mawkibId={mawkibId}
        mobileFocusTrigger={mobileFocusTrigger}
        onSuccess={(reservation) => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          setCompletedReservation(reservation);
          setFormKey((current) => current + 1);
          setSuccessModalOpen(true);
        }}
        onCancel={() => navigate('/dashboard')}
      />

      <QuickReservationSuccessModal
        open={successModalOpen}
        reservation={completedReservation}
        onQuickReserveAgain={handleQuickReserveAgain}
        onViewPilgrimCard={handleViewPilgrimCard}
        onClose={handleSuccessModalClose}
      />

      <PilgrimCardModal
        open={pilgrimCardOpen}
        onClose={() => setPilgrimCardOpen(false)}
        reservation={completedReservation}
        elevated
      />
    </div>
  );
}

/** @deprecated Use QuickReservationPage */
export const TodayReservationPage = QuickReservationPage;
