import api from './api';
import type { Reservation } from '../types';

export interface CreateGuestReservationPayload {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  password?: string;
  province?: string;
  city?: string;
  mawkibId: number;
  reservationDate: string;
  reservationEndDate: string;
  maleGuestCount: number;
  femaleGuestCount: number;
  description?: string;
  companions?: string;
  plannedCheckInTime?: string;
  plannedCheckOutTime?: string;
}

export interface GuestReservationResponse {
  message: string;
  reservationId: number;
  trackingCode: string;
  status: string;
  mawkibName: string;
  reservationDate: string;
  reservationEndDate: string;
  maleGuestCount: number;
  femaleGuestCount: number;
}

export const guestApi = {
  createReservation: (payload: CreateGuestReservationPayload) =>
    api
      .post<GuestReservationResponse>('/reservations/guest', payload)
      .then((r) => r.data),

  trackReservation: (trackingCode: string) =>
    api
      .get<Reservation>('/reservations/guest/track', {
        params: { trackingCode: trackingCode.trim() },
      })
      .then((r) => r.data),

  trackReservationsByMobile: (mobileNumber: string) =>
    api
      .get<Reservation[]>('/reservations/guest/track-by-mobile', {
        params: { mobileNumber: mobileNumber.trim() },
      })
      .then((r) => r.data),

  checkIn: (trackingCode: string) =>
    api
      .post<Reservation>('/reservations/guest/check-in', {
        trackingCode: trackingCode.trim(),
      })
      .then((r) => r.data),

  checkOut: (trackingCode: string) =>
    api
      .post<Reservation>('/reservations/guest/check-out', {
        trackingCode: trackingCode.trim(),
      })
      .then((r) => r.data),
};
