import type { Reservation } from '../types';
import type { ReservationFormSuccess } from '../components/reservations/ReservationForm';

export type GuestSuccess = Extract<ReservationFormSuccess, { variant: 'guest' }>;

export function buildReservationFromGuestSuccess(
  success: GuestSuccess,
): Reservation {
  const snapshot = success.mawkibSnapshot;
  const fullName = success.fullName.trim() || 'زائر';

  return {
    id: success.reservationId,
    trackingCode: success.trackingCode,
    maleGuestCount: success.maleGuestCount,
    femaleGuestCount: success.femaleGuestCount,
    pilgrimMobile: success.mobileNumber,
    reservationDate: success.reservationDate,
    reservationEndDate: success.reservationEndDate,
    status: 'Pending',
    companions: success.companions,
    mawkib: {
      id: success.mawkibId,
      name: snapshot?.name ?? success.mawkibName,
      address: snapshot?.address,
      phoneNumber: snapshot?.phoneNumber,
      imageUrl: snapshot?.imageUrl,
      owner: snapshot?.owner,
    },
    pilgrim: {
      id: 0,
      fullName,
      mobileNumber: success.mobileNumber,
    },
    reservedBy: {
      id: 0,
      fullName,
      mobileNumber: success.mobileNumber,
    },
  };
}
