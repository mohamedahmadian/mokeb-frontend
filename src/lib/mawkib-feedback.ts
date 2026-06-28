import api from './api';
import type { MawkibFeedback } from '../types';

export type MawkibFeedbackReplyStatus = 'all' | 'replied' | 'pending';

export interface MawkibFeedbackFilters {
  search?: string;
  mawkibId?: number;
  authorUserId?: number;
  replyStatus?: MawkibFeedbackReplyStatus;
  createdFrom?: string;
  createdTo?: string;
}

export interface CreateMawkibFeedbackPayload {
  mawkibId: number;
  content: string;
}

export interface ReplyMawkibFeedbackPayload {
  ownerReply: string;
}

export interface UpdateMawkibFeedbackPayload {
  mawkibId?: number;
  content?: string;
}

export function canManageMawkibFeedback(feedback: MawkibFeedback) {
  return !feedback.ownerReply;
}

function buildParams(filters?: MawkibFeedbackFilters) {
  if (!filters) return undefined;
  const params: Record<string, string> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params[key] = String(value);
  });
  return Object.keys(params).length > 0 ? params : undefined;
}

export const mawkibFeedbackApi = {
  create: (payload: CreateMawkibFeedbackPayload) =>
    api.post<MawkibFeedback>('/mawkib-feedback', payload).then((r) => r.data),

  listMine: (filters: MawkibFeedbackFilters = {}) =>
    api
      .get<MawkibFeedback[]>('/mawkib-feedback/my', { params: buildParams(filters) })
      .then((r) => r.data),

  listInbox: (filters: MawkibFeedbackFilters = {}) =>
    api
      .get<MawkibFeedback[]>('/mawkib-feedback/inbox', { params: buildParams(filters) })
      .then((r) => r.data),

  listAll: (filters: MawkibFeedbackFilters = {}) =>
    api
      .get<MawkibFeedback[]>('/mawkib-feedback/admin', { params: buildParams(filters) })
      .then((r) => r.data),

  getById: (id: number) =>
    api.get<MawkibFeedback>(`/mawkib-feedback/${id}`).then((r) => r.data),

  reply: (id: number, payload: ReplyMawkibFeedbackPayload) =>
    api
      .patch<MawkibFeedback>(`/mawkib-feedback/${id}/reply`, payload)
      .then((r) => r.data),

  update: (id: number, payload: UpdateMawkibFeedbackPayload) =>
    api.patch<MawkibFeedback>(`/mawkib-feedback/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    api
      .delete<{ id: number; message: string }>(`/mawkib-feedback/${id}`)
      .then((r) => r.data),
};
