import api from './api';
import type { HonoraryVolunteerServiceType } from './honorary-volunteer';
import type {
  AuthResponse,
  HonoraryVolunteerApplication,
  HonoraryVolunteerApplicationStatus,
  HonoraryVolunteerApplicantType,
} from '../types';

export interface CreateHonoraryVolunteerApplicationPayload {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  password: string;
  province?: string;
  city?: string;
  mawkibId?: number;
  description?: string;
  serviceTypes: HonoraryVolunteerServiceType[];
  serviceDescription?: string;
  availabilityStartDate: string;
  availabilityEndDate: string;
  availabilityDescription?: string;
}

export type CreateMawkibNeedPayload = Omit<CreateHonoraryVolunteerApplicationPayload, 'password'>;

export type CreateAuthenticatedVolunteerApplicationPayload = Omit<
  CreateHonoraryVolunteerApplicationPayload,
  'firstName' | 'lastName' | 'mobileNumber' | 'password' | 'province' | 'city'
>;

export interface HonoraryVolunteerFilters {
  status?: HonoraryVolunteerApplicationStatus;
  applicantType?: HonoraryVolunteerApplicantType;
  serviceType?: HonoraryVolunteerServiceType;
  mawkibId?: number;
  search?: string;
  availabilityFrom?: string;
  availabilityTo?: string;
  createdFrom?: string;
  createdTo?: string;
}

function buildParams(filters?: HonoraryVolunteerFilters) {
  if (!filters) return undefined;
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params[key] = String(value);
  });
  return Object.keys(params).length > 0 ? params : undefined;
}

export interface CreateHonoraryVolunteerApplicationResponse extends HonoraryVolunteerApplication {
  accessToken?: string;
  user?: AuthResponse['user'];
}

export const honoraryVolunteersApi = {
  createApplication: (payload: CreateHonoraryVolunteerApplicationPayload) =>
    api
      .post<CreateHonoraryVolunteerApplicationResponse>('/honorary-volunteers', payload)
      .then((r) => r.data),

  createMyApplication: (payload: CreateAuthenticatedVolunteerApplicationPayload) =>
    api
      .post<HonoraryVolunteerApplication>('/honorary-volunteers/me', payload)
      .then((r) => r.data),

  createOwnerNeed: (payload: CreateMawkibNeedPayload) =>
    api.post<HonoraryVolunteerApplication>('/honorary-volunteers/owner', payload).then((r) => r.data),

  listPublicNeeds: (filters?: HonoraryVolunteerFilters) =>
    api
      .get<HonoraryVolunteerApplication[]>('/honorary-volunteers/public/needs', {
        params: buildParams(filters),
      })
      .then((r) => r.data),

  track: (trackingCode: string) =>
    api
      .get<HonoraryVolunteerApplication>('/honorary-volunteers/public/track', {
        params: { trackingCode: trackingCode.trim() },
      })
      .then((r) => r.data),

  trackByMobile: (mobileNumber: string) =>
    api
      .get<HonoraryVolunteerApplication[]>('/honorary-volunteers/public/track-by-mobile', {
        params: { mobileNumber: mobileNumber.trim() },
      })
      .then((r) => r.data),

  list: (filters: HonoraryVolunteerFilters = {}) =>
    api
      .get<HonoraryVolunteerApplication[]>('/honorary-volunteers', { params: buildParams(filters) })
      .then((r) => r.data),

  listMy: () =>
    api.get<HonoraryVolunteerApplication[]>('/honorary-volunteers/my').then((r) => r.data),

  getById: (id: number) =>
    api.get<HonoraryVolunteerApplication>(`/honorary-volunteers/${id}`).then((r) => r.data),

  update: (id: number, payload: Partial<CreateHonoraryVolunteerApplicationPayload>) =>
    api
      .patch<HonoraryVolunteerApplication>(`/honorary-volunteers/${id}`, payload)
      .then((r) => r.data),

  cancel: (id: number) =>
    api
      .patch<HonoraryVolunteerApplication>(`/honorary-volunteers/${id}/cancel`)
      .then((r) => r.data),

  review: (
    id: number,
    payload: { status: 'Approved' | 'Rejected'; reviewNote?: string },
  ) =>
    api
      .patch<HonoraryVolunteerApplication>(`/honorary-volunteers/${id}/review`, payload)
      .then((r) => r.data),
};
