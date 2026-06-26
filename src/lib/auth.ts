import api from './api';
import type { AuthResponse } from '../types';

export interface RegisterPilgrimPayload {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  password: string;
  province?: string;
  city?: string;
  description?: string;
  whatsapp?: string;
  telegram?: string;
  bale?: string;
  eitaa?: string;
  email?: string;
}

export interface RegisterMawkibOwnerPayload {
  fullName: string;
  mobileNumber: string;
  password: string;
  province?: string;
  city?: string;
  description?: string;
  whatsapp?: string;
  telegram?: string;
  bale?: string;
  eitaa?: string;
  email?: string;
}

export const authApi = {
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api
      .patch<{ message: string }>('/auth/change-password', payload)
      .then((r) => r.data),

  registerPilgrim: (payload: RegisterPilgrimPayload) =>
    api.post<AuthResponse>('/auth/register/pilgrim', payload).then((r) => r.data),

  registerMawkibOwner: (payload: RegisterMawkibOwnerPayload) =>
    api
      .post<AuthResponse>('/auth/register/mawkib-owner', payload)
      .then((r) => r.data),
};
