import { Link } from 'react-router-dom';
import { NavIcon } from '../ui/NavIcons';
import {
  isReservationMealPlanLinkVisible,
  mealPlanPagePath,
} from '../../lib/meal-plan-utils';
import type { Reservation } from '../../types';

interface ReservationMealPlanLinkProps {
  reservation: Reservation;
  isAdmin: boolean;
  isMawkibOwner: boolean;
  className?: string;
}

export function ReservationMealPlanLink({
  reservation,
  isAdmin,
  isMawkibOwner,
  className,
}: ReservationMealPlanLinkProps) {
  if (
    !isReservationMealPlanLinkVisible(reservation, { isAdmin, isMawkibOwner })
  ) {
    return null;
  }

  return (
    <Link
      to={mealPlanPagePath(reservation.id)}
      className={`inline-flex items-center justify-center gap-1.5 ${className ?? ''}`}
    >
      <NavIcon name="meals" className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      برنامه غذایی
    </Link>
  );
}
