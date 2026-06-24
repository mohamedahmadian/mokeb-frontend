import api from './api';
import type { MawkibCapacitySnapshot } from './capacity';
import type { Reservation } from '../types';

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface ReservationFilters {
  mawkibId?: number;
  status?: ReservationStatus;
  reservationDateFrom?: string;
  reservationDateTo?: string;
  pilgrimName?: string;
  pilgrimMobile?: string;
  pilgrimUserId?: number;
  guestCountMin?: number;
  guestCountMax?: number;
}

export interface CreateReservationPayload {
  mawkibId: number;
  reservationDate: string;
  reservationEndDate: string;
  maleGuestCount: number;
  femaleGuestCount: number;
  pilgrimMobile: string;
  description?: string;
  companions?: string;
  pilgrimUserId?: number;
}

function buildParams(filters?: ReservationFilters) {
  const params = new URLSearchParams();
  if (!filters) return params;
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  return params;
}

export const reservationsApi = {
  getAdminList: (filters?: ReservationFilters) =>
    api
      .get<Reservation[]>('/reservations/admin', { params: buildParams(filters) })
      .then((r) => r.data),

  getMyList: (filters?: ReservationFilters) =>
    api
      .get<Reservation[]>('/reservations/my', { params: buildParams(filters) })
      .then((r) => r.data),

  getOne: (id: number) =>
    api.get<Reservation>(`/reservations/${id}`).then((r) => r.data),

  create: (payload: CreateReservationPayload) =>
    api.post<Reservation>('/reservations', payload).then((r) => r.data),

  updateStatus: (id: number, status: ReservationStatus) =>
    api
      .patch<Reservation>(`/reservations/${id}/status`, { status })
      .then((r) => r.data),

  cancel: (id: number, note?: string) =>
    api
      .patch<Reservation>(`/reservations/${id}/cancel`, { note })
      .then((r) => r.data),

  remove: (id: number) =>
    api
      .delete<{ id: number; message: string }>(`/reservations/${id}`)
      .then((r) => r.data),

  getCapacity: (mawkibId: number, date: string) =>
    api
      .get<MawkibCapacitySnapshot>(`/mawkibs/${mawkibId}/capacity`, { params: { date } })
      .then((r) => r.data),
};
