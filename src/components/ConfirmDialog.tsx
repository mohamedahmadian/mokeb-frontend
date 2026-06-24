import { Modal } from './Modal';
import { btnDanger, btnPrimary, btnSecondary } from '../lib/styles';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  variant?: 'danger' | 'default';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تایید',
  loading = false,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-6 text-sm text-slate-600">{message}</p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button type="button" onClick={onClose} disabled={loading} className={btnSecondary}>
          انصراف
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={variant === 'danger' ? btnDanger : btnPrimary}
        >
          {loading ? 'در حال انجام...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
