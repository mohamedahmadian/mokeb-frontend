import api from './api';
import type { AuthResponse, UserGender } from '../types';

export interface RegisterPilgrimPayload {
  firstName: string;
  lastName: string;
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
  whatsapp?: string;
  telegram?: string;
  bale?: string;
  eitaa?: string;
  email?: string;
}

export interface RegisterMawkibOwnerPayload {
  fullName: string;
  mobileNumber: string;
  nationalId?: string;
  gender?: UserGender;
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
  isMobileRegistered: (mobileNumber: string) =>
    api
      .get<{ registered: boolean; fullName?: string }>('/auth/mobile-registered', {
        params: { mobileNumber },
      })
      .then((r) => r.data),

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
