export const RESERVATION_STATUS_OPTIONS = [
  { value: 'Pending', label: 'در انتظار' },
  { value: 'Confirmed', label: 'تایید شده' },
  { value: 'Cancelled', label: 'لغو شده' },
  { value: 'Completed', label: 'تکمیل شده' },
] as const;

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  Pending: 'در انتظار',
  Confirmed: 'تایید شده',
  Cancelled: 'لغو شده',
  Completed: 'تکمیل شده',
};

export const MAWKIB_STATUS_OPTIONS = [
  { value: 'Pending', label: 'در انتظار' },
  { value: 'Approved', label: 'تایید شده' },
  { value: 'Rejected', label: 'رد شده' },
] as const;

export const MAWKIB_STATUS_LABELS: Record<string, string> = {
  Pending: 'در انتظار',
  Approved: 'تایید شده',
  Rejected: 'رد شده',
};

export const ROLE_OPTIONS = [
  { value: 'Admin', label: 'مدیر' },
  { value: 'Pilgrim', label: 'زائر' },
  { value: 'MawkibOwner', label: 'موکب‌دار' },
] as const;

export const ROLE_LABELS: Record<string, string> = {
  Admin: 'مدیر',
  Pilgrim: 'زائر',
  MawkibOwner: 'موکب‌دار',
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response
  ) {
    const data = error.response.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const message = data.message;
      if (Array.isArray(message)) return message.join('، ');
      if (typeof message === 'string') return message;
    }
  }
  if (error instanceof Error) {
    const msg = error.message.trim();
    if (msg && !/^Request failed with status code \d+$/i.test(msg)) {
      return msg;
    }
  }
  return fallback;
}
