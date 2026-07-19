import api from './api';
import type { MawkibAmenityKey } from '../components/mawkibs/MawkibExtraFields';
import type { MawkibCity, MawkibCountry } from './mawkib-locations';
import type { Mawkib, MawkibExtraFields, MawkibStatus } from '../types';

export type MawkibCapacityFilter = 'all' | 'available' | 'full';

export interface MawkibFilters extends Partial<Pick<MawkibExtraFields, MawkibAmenityKey>> {
  q?: string;
  name?: string;
  ownerName?: string;
  phoneNumber?: string;
  ownerUserId?: number;
  status?: MawkibStatus;
  country?: MawkibCountry;
  mawkibCity?: MawkibCity;
  reservationDate?: string;
  reservationDateFrom?: string;
  reservationDateTo?: string;
  minAvailableMaleCapacity?: number;
  minAvailableFemaleCapacity?: number;
  hasAvailability?: boolean;
  capacityFilter?: MawkibCapacityFilter;
  serviceStartFrom?: string;
  serviceStartTo?: string;
  serviceEndFrom?: string;
  serviceEndTo?: string;
  page?: number;
  pageSize?: number;
  all?: boolean;
}

export interface PaginatedMawkibsResponse {
  items: Mawkib[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_MAWKIBS_PAGE_SIZE = 10;

export interface CreateMawkibPayload extends MawkibExtraFields {
  name: string;
  address: string;
  neshanAddressUrl?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber: string;
  description?: string;
  facilities?: string;
  services?: string;
  serviceStartDate?: string;
  serviceEndDate?: string;
  maleCapacity: number;
  femaleCapacity: number;
  imageUrl?: string;
  galleryImageUrls?: string[];
  ownerUserId: number;
  status?: MawkibStatus;
  defaultCheckInTime?: string;
  defaultCheckOutTime?: string;
  onlineReservationEnabled?: boolean;
  autoApprovePilgrimReservations?: boolean;
  recordCheckInOnReservationConfirm?: boolean;
  skipCapacityCheckEnabled?: boolean;
  mealPlanManagementEnabled?: boolean;
}

export interface UpdateMawkibPayload extends MawkibExtraFields {
  name?: string;
  address?: string;
  neshanAddressUrl?: string | null;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  description?: string;
  facilities?: string;
  services?: string;
  serviceStartDate?: string;
  serviceEndDate?: string;
  maleCapacity?: number;
  femaleCapacity?: number;
  imageUrl?: string | null;
  galleryImageUrls?: string[];
  ownerUserId?: number;
  status?: MawkibStatus;
  defaultCheckInTime?: string;
  defaultCheckOutTime?: string;
  onlineReservationEnabled?: boolean;
  autoApprovePilgrimReservations?: boolean;
  recordCheckInOnReservationConfirm?: boolean;
  skipCapacityCheckEnabled?: boolean;
  mealPlanManagementEnabled?: boolean;
}

export interface DeleteMawkibResponse {
  id: number;
  message: string;
  softDeleted: boolean;
}

export interface MawkibInventoryHorizon {
  horizonDays: number;
  minDate: string;
  maxDate: string;
}

export interface MawkibDailyInventoryDay {
  date: string;
  maleCapacity: number;
  femaleCapacity: number;
  reservedMale: number;
  reservedFemale: number;
  availableMale: number;
  availableFemale: number;
}

export interface MawkibInventoryRange {
  mawkibId: number;
  mawkibName: string;
  startDate: string;
  endDate: string;
  horizon: MawkibInventoryHorizon;
  days: MawkibDailyInventoryDay[];
}

export interface MawkibInventoryReconcileResult {
  mawkibId: number;
  startDate: string;
  endDate: string;
  daysUpdated: number;
  reservationsProcessed: number;
}

function buildParams(filters?: MawkibFilters) {
  const params = new URLSearchParams();
  if (!filters) return params;
  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === 'boolean') {
      if (value) params.set(key, 'true');
      return;
    }
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  return params;
}

type PublicListFilters = Pick<
  MawkibFilters,
  | 'q'
  | 'name'
  | 'ownerName'
  | 'country'
  | 'mawkibCity'
  | 'reservationDate'
  | 'reservationDateFrom'
  | 'reservationDateTo'
  | 'minAvailableMaleCapacity'
  | 'minAvailableFemaleCapacity'
  | 'hasAvailability'
  | 'capacityFilter'
  | 'serviceStartFrom'
  | 'serviceStartTo'
  | 'serviceEndFrom'
  | 'serviceEndTo'
  | MawkibAmenityKey
  | 'page'
  | 'pageSize'
  | 'all'
>;

export const mawkibsApi = {
  getPublicList: (filters?: PublicListFilters) =>
    api.get<Mawkib[]>('/mawkibs', { params: buildParams(filters) }).then((r) => r.data),

  getPublicListPaginated: (filters?: PublicListFilters) =>
    api
      .get<PaginatedMawkibsResponse>('/mawkibs', { params: buildParams(filters) })
      .then((r) => r.data),

  getPublicListForExport: (filters?: Omit<PublicListFilters, 'page' | 'pageSize'>) =>
    api
      .get<Mawkib[]>('/mawkibs', { params: buildParams({ ...filters, all: true }) })
      .then((r) => r.data),

  getPublicOne: (id: number) =>
    api.get<Mawkib>(`/mawkibs/public/${id}`).then((r) => r.data),

  getAdminList: (filters?: MawkibFilters) =>
    api
      .get<Mawkib[]>('/mawkibs/admin', { params: buildParams(filters) })
      .then((r) => r.data),

  getAdminListPaginated: (filters?: MawkibFilters) =>
    api
      .get<PaginatedMawkibsResponse>('/mawkibs/admin', { params: buildParams(filters) })
      .then((r) => r.data),

  getAdminListForExport: (filters?: Omit<MawkibFilters, 'page' | 'pageSize'>) =>
    api
      .get<Mawkib[]>('/mawkibs/admin', { params: buildParams({ ...filters, all: true }) })
      .then((r) => r.data),

  getMyList: (filters?: MawkibFilters) =>
    api
      .get<Mawkib[]>('/mawkibs/my', { params: buildParams(filters) })
      .then((r) => r.data),

  getMyListPaginated: (filters?: MawkibFilters) =>
    api
      .get<PaginatedMawkibsResponse>('/mawkibs/my', { params: buildParams(filters) })
      .then((r) => r.data),

  getMyListForExport: (filters?: Omit<MawkibFilters, 'page' | 'pageSize'>) =>
    api
      .get<Mawkib[]>('/mawkibs/my', { params: buildParams({ ...filters, all: true }) })
      .then((r) => r.data),

  getOne: (id: number) => api.get<Mawkib>(`/mawkibs/${id}`).then((r) => r.data),

  create: (payload: CreateMawkibPayload) =>
    api.post<Mawkib>('/mawkibs', payload).then((r) => r.data),

  update: (id: number, payload: UpdateMawkibPayload) =>
    api.patch<Mawkib>(`/mawkibs/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<DeleteMawkibResponse>(`/mawkibs/${id}`).then((r) => r.data),

  getInventoryHorizon: () =>
    api.get<MawkibInventoryHorizon>('/mawkibs/inventory/horizon').then((r) => r.data),

  getPublicInventory: (id: number, startDate: string, endDate: string) =>
    api
      .get<MawkibInventoryRange>(`/mawkibs/public/${id}/inventory`, {
        params: { startDate, endDate },
      })
      .then((r) => r.data),

  getInventory: (id: number, startDate: string, endDate: string) =>
    api
      .get<MawkibInventoryRange>(`/mawkibs/${id}/inventory`, {
        params: { startDate, endDate },
      })
      .then((r) => r.data),

  reconcileInventory: (id: number, startDate: string, endDate: string) =>
    api
      .post<MawkibInventoryReconcileResult>(`/mawkibs/${id}/inventory/reconcile`, {
        startDate,
        endDate,
      })
      .then((r) => r.data),
};
