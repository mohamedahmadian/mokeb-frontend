import { toast as sonner } from 'sonner';
import { getApiErrorMessage } from './constants';

type ToastOptions = {
  description?: string;
};

export const toast = {
  success(message: string, options?: ToastOptions) {
    sonner.success(message, options);
  },

  error(message: string, options?: ToastOptions) {
    sonner.error(message, options);
  },

  warning(message: string, options?: ToastOptions) {
    sonner.warning(message, options);
  },

  info(message: string, options?: ToastOptions) {
    sonner.info(message, options);
  },
};

export function toastApiError(err: unknown, fallback: string) {
  toast.error(getApiErrorMessage(err, fallback));
}
