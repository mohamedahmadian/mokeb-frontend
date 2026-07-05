import api from './api';
import type { AdminUser, RoleName, UserGender, UserSocialFields } from '../types';

export interface CreateUserPayload extends UserSocialFields {
  fullName: string;
  mobileNumber: string;
  nationalId?: string;
  nationalIdCardImageUrl?: string;
  gender?: UserGender;
  birthDate?: string;
  country?: string;
  passportNumber?: string;
  password: string;
  province?: string;
  city?: string;
  description?: string;
  roles: RoleName[];
}

export interface UpdateUserPayload extends UserSocialFields {
  fullName?: string;
  nationalId?: string;
  nationalIdCardImageUrl?: string | null;
  imageUrl?: string | null;
  gender?: UserGender | null;
  birthDate?: string | null;
  country?: string | null;
  passportNumber?: string | null;
  province?: string;
  city?: string;
  description?: string;
  isActive?: boolean;
  password?: string;
  roles?: RoleName[];
}

export interface DeleteUserResponse {
  id: number;
  message: string;
  softDeleted: boolean;
}

export interface CreateQuickPilgrimPayload extends UserSocialFields {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  nationalId?: string;
  nationalIdCardImageUrl?: string;
  gender?: UserGender;
  birthDate?: string;
  country?: string;
  passportNumber?: string;
  province?: string;
  city?: string;
  password?: string;
  description?: string;
}

export interface UserListFilters {
  role?: RoleName;
  fullName?: string;
  mobileNumber?: string;
  nationalId?: string;
  gender?: UserGender;
  birthDate?: string;
  province?: string;
  city?: string;
  isActive?: boolean;
  search?: string;
  scope?: 'mine' | 'all';
  mawkibId?: number;
}

export const MIN_PILGRIM_SEARCH_LENGTH = 2;

export interface PilgrimOption {
  id: number;
  fullName: string;
  mobileNumber: string;
  city?: string | null;
}

export interface PaginatedPilgrimsResponse {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_PILGRIMS_PAGE_SIZE = 10;

export const usersApi = {
  getAll: (filters?: UserListFilters) =>
    api
      .get<AdminUser[]>('/users', { params: filters })
      .then((r) => r.data),

  getMe: () => api.get<AdminUser>('/users/me').then((r) => r.data),

  getPilgrims: (filters?: Omit<UserListFilters, 'role' | 'scope'>) =>
    api
      .get<AdminUser[]>('/users/pilgrims', {
        params: { scope: 'mine', ...filters },
      })
      .then((r) => r.data),

  getPilgrimsPaginated: (
    filters?: Omit<UserListFilters, 'role' | 'scope'> & {
      page?: number;
      pageSize?: number;
    },
  ) =>
    api
      .get<PaginatedPilgrimsResponse>('/users/pilgrims', {
        params: { scope: 'mine', ...filters },
      })
      .then((r) => r.data),

  getPilgrimsForExport: (filters?: Omit<UserListFilters, 'role' | 'scope'>) =>
    api
      .get<AdminUser[]>('/users/pilgrims', {
        params: { scope: 'mine', all: true, ...filters },
      })
      .then((r) => r.data),

  getMawkibOwners: (filters?: UserListFilters) =>
    usersApi.getAll({ ...filters, role: 'MawkibOwner' }),

  getHonoraryServants: (filters?: UserListFilters) =>
    usersApi.getAll({ ...filters, role: 'HonoraryServant' }),

  searchMawkibOwners: (search?: string) =>
    usersApi.getAll({
      role: 'MawkibOwner',
      ...(search ? { search } : {}),
    }),

  searchPilgrims: (search: string) =>
    api
      .get<PilgrimOption[]>('/users/pilgrims', {
        params: { scope: 'all', search },
      })
      .then((r) => r.data),

  getOne: (id: number) => api.get<AdminUser>(`/users/${id}`).then((r) => r.data),

  create: (payload: CreateUserPayload) =>
    api.post<AdminUser>('/users', payload).then((r) => r.data),

  createQuickPilgrim: (payload: CreateQuickPilgrimPayload) =>
    api.post<AdminUser>('/users/quick-pilgrim', payload).then((r) => r.data),

  update: (id: number, payload: UpdateUserPayload) =>
    api.patch<AdminUser>(`/users/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api.delete<DeleteUserResponse>(`/users/${id}`).then((r) => r.data),
};
