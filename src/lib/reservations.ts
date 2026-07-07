import api from "./api";
import type { MawkibCapacitySnapshot } from "./capacity";
import type { Reservation } from "../types";

export type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Completed";

export interface ReservationFilters {
  mawkibId?: number;
  status?: ReservationStatus;
  reservationDateFrom?: string;
  reservationDateTo?: string;
  pilgrimName?: string;
  pilgrimMobile?: string;
  pilgrimNationalId?: string;
  trackingCode?: string;
  /** Dashboard track lookup — searches code, mobile, and national ID (OR). */
  lookupQuery?: string;
  /** With lookupQuery: return only the best-matching reservation. */
  lookupSingle?: boolean;
  /** With lookupQuery: exact field match instead of partial contains. */
  lookupExact?: boolean;
  pilgrimUserId?: number;
  guestCountMin?: number;
  guestCountMax?: number;
  createdAtFrom?: string;
  createdAtTo?: string;
  mawkibName?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  all?: boolean;
}

export interface PaginatedReservationsResponse {
  items: Reservation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_RESERVATIONS_PAGE_SIZE = 10;
export const WAITING_LIST_PAGE_SIZE = 20;

export interface PendingCountsByMawkib {
  total: number;
  byMawkib: { mawkibId: number; mawkibName: string; count: number }[];
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
  plannedCheckInTime?: string;
  plannedCheckOutTime?: string;
  skipCapacityCheck?: boolean;
  trackingCode?: string;
}

function buildParams(filters?: ReservationFilters) {
  const params = new URLSearchParams();
  if (!filters) return params;
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      if (value) params.set(key, "true");
      return;
    }
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  return params;
}

export const reservationsApi = {
  getAdminList: (filters?: ReservationFilters) =>
    api
      .get<
        Reservation[]
      >("/reservations/admin", { params: buildParams(filters) })
      .then((r) => r.data),

  getAdminListPaginated: (filters?: ReservationFilters) =>
    api
      .get<PaginatedReservationsResponse>("/reservations/admin", {
        params: buildParams(filters),
      })
      .then((r) => r.data),

  getAdminListForExport: (
    filters?: Omit<ReservationFilters, "page" | "pageSize">,
  ) =>
    api
      .get<Reservation[]>("/reservations/admin", {
        params: buildParams({ ...filters, all: true }),
      })
      .then((r) => r.data),

  getMyList: (filters?: ReservationFilters) =>
    api
      .get<Reservation[]>("/reservations/my", { params: buildParams(filters) })
      .then((r) => r.data),

  getMyListPaginated: (filters?: ReservationFilters) =>
    api
      .get<PaginatedReservationsResponse>("/reservations/my", {
        params: buildParams(filters),
      })
      .then((r) => r.data),

  getMyListForExport: (
    filters?: Omit<ReservationFilters, "page" | "pageSize">,
  ) =>
    api
      .get<Reservation[]>("/reservations/my", {
        params: buildParams({ ...filters, all: true }),
      })
      .then((r) => r.data),

  getPendingCounts: () =>
    api
      .get<PendingCountsByMawkib>("/reservations/pending-counts")
      .then((r) => r.data),

  getLatestForPilgrimCard: (pilgrimUserId: number, ownerScope = false) =>
    api
      .get<Reservation | null>(`/reservations/pilgrim-card/${pilgrimUserId}`, {
        params: ownerScope ? { ownerScope: "true" } : {},
      })
      .then((r) => r.data),

  getOne: (id: number) =>
    api.get<Reservation>(`/reservations/${id}`).then((r) => r.data),

  create: (payload: CreateReservationPayload) =>
    api.post<Reservation>("/reservations", payload).then((r) => r.data),

  updateStatus: (id: number, status: ReservationStatus) =>
    api
      .patch<Reservation>(`/reservations/${id}/status`, { status })
      .then((r) => r.data),

  cancel: (id: number, note?: string) =>
    api
      .patch<Reservation>(`/reservations/${id}/cancel`, { note })
      .then((r) => r.data),

  extend: (
    id: number,
    payload?: { reservationEndDate?: string; stayDays?: number },
  ) =>
    api
      .post<Reservation>(`/reservations/${id}/extend`, payload ?? {})
      .then((r) => r.data),

  remove: (id: number) =>
    api
      .delete<{ id: number; message: string }>(`/reservations/${id}`)
      .then((r) => r.data),

  getCapacity: (mawkibId: number, date: string) =>
    api
      .get<MawkibCapacitySnapshot>(`/mawkibs/${mawkibId}/capacity`, {
        params: { date },
      })
      .then((r) => r.data),

  checkIn: (id: number, recordedAt?: string) =>
    api
      .post<Reservation>(`/reservations/${id}/check-in`, { recordedAt })
      .then((r) => r.data),

  checkOut: (id: number, recordedAt?: string) =>
    api
      .post<Reservation>(`/reservations/${id}/check-out`, { recordedAt })
      .then((r) => r.data),

  updateCheckIn: (id: number, recordedAt: string) =>
    api
      .patch<Reservation>(`/reservations/${id}/check-in`, { recordedAt })
      .then((r) => r.data),

  updateCheckOut: (id: number, recordedAt: string) =>
    api
      .patch<Reservation>(`/reservations/${id}/check-out`, { recordedAt })
      .then((r) => r.data),

  createReview: (id: number, content: string) =>
    api
      .post<Reservation>(`/reservations/${id}/review`, { content })
      .then((r) => r.data),

  updateReview: (id: number, content: string) =>
    api
      .patch<Reservation>(`/reservations/${id}/review`, { content })
      .then((r) => r.data),

  replyToReview: (id: number, adminReply: string) =>
    api
      .patch<Reservation>(`/reservations/${id}/review/reply`, { adminReply })
      .then((r) => r.data),

  createDeliveredItem: (
    id: number,
    payload: {
      itemName: string;
      quantity: number;
      description?: string;
    },
  ) =>
    api
      .post<Reservation>(`/reservations/${id}/delivered-items`, payload)
      .then((r) => r.data),

  updateDeliveredItem: (
    id: number,
    itemId: number,
    payload: {
      itemName: string;
      quantity: number;
      description?: string;
    },
  ) =>
    api
      .patch<Reservation>(
        `/reservations/${id}/delivered-items/${itemId}`,
        payload,
      )
      .then((r) => r.data),

  receiveDeliveredItem: (id: number, itemId: number) =>
    api
      .patch<Reservation>(
        `/reservations/${id}/delivered-items/${itemId}/receive`,
      )
      .then((r) => r.data),

  removeDeliveredItem: (id: number, itemId: number) =>
    api
      .delete<Reservation>(`/reservations/${id}/delivered-items/${itemId}`)
      .then((r) => r.data),
};
