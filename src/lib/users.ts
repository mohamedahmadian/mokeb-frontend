import api from './api';
import type { AdminUser, RoleName, UserSocialFields } from '../types';

export interface CreateUserPayload extends UserSocialFields {
  fullName: string;
  mobileNumber: string;
  password: string;
  province?: string;
  city?: string;
  description?: string;
  roles: RoleName[];
}

export interface UpdateUserPayload extends UserSocialFields {
  fullName?: string;
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
  province?: string;
  city?: string;
  password?: string;
  description?: string;
}

export interface UserListFilters {
  role?: RoleName;
  fullName?: string;
  mobileNumber?: string;
  province?: string;
  city?: string;
  isActive?: boolean;
  search?: string;
}

export interface PilgrimOption {
  id: number;
  fullName: string;
  mobileNumber: string;
  city?: string | null;
}

export const usersApi = {
  getAll: (filters?: UserListFilters) =>
    api
      .get<AdminUser[]>('/users', { params: filters })
      .then((r) => r.data),

  getMe: () => api.get<AdminUser>('/users/me').then((r) => r.data),

  getPilgrims: (filters?: Omit<UserListFilters, 'role'>) =>
    api.get<AdminUser[]>('/users/pilgrims', { params: filters }).then((r) => r.data),

  getMawkibOwners: (filters?: UserListFilters) =>
    usersApi.getAll({ ...filters, role: 'MawkibOwner' }),

  searchMawkibOwners: (search?: string) =>
    usersApi.getAll({
      role: 'MawkibOwner',
      ...(search ? { search } : {}),
    }),

  searchPilgrims: (search?: string) =>
    api
      .get<PilgrimOption[]>('/users/pilgrims', {
        params: search ? { search } : undefined,
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
