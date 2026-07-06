import api from './api';
import type {
  ReservationEventType,
  ReservationEventsResponse,
} from './reservation-events';

export interface RecordReservationEventPayload {
  eventType: ReservationEventType;
  recordedAt?: string;
  description?: string;
}

export const reservationEventsApi = {
  list: (reservationId: number) =>
    api
      .get<ReservationEventsResponse>(`/reservations/${reservationId}/events`)
      .then((r) => r.data),

  record: (reservationId: number, payload: RecordReservationEventPayload) =>
    api
      .post<ReservationEventsResponse & { event: unknown; reservation: unknown }>(
        `/reservations/${reservationId}/events`,
        payload,
      )
      .then((r) => r.data),
};
