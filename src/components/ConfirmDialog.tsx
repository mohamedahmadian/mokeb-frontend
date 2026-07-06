import { Modal } from './Modal';
import { NavIcon, type NavIconName } from './ui/NavIcons';
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
  cancelClassName?: string;
  confirmClassName?: string;
  cancelIcon?: NavIconName;
  confirmIcon?: NavIconName;
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
  cancelClassName,
  confirmClassName,
  cancelIcon,
  confirmIcon,
}: ConfirmDialogProps) {
  const cancelBtnClass = cancelClassName ?? btnSecondary;
  const confirmBtnClass =
    confirmClassName ?? (variant === 'danger' ? btnDanger : btnPrimary);

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="mb-6 text-sm text-slate-600">{message}</p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button type="button" onClick={onClose} disabled={loading} className={cancelBtnClass}>
          {cancelIcon ? (
            <NavIcon name={cancelIcon} className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          ) : null}
          انصراف
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={confirmBtnClass}
        >
          {confirmIcon ? (
            <NavIcon name={confirmIcon} className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          ) : null}
          {loading ? 'در حال انجام...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
