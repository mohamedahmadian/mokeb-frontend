import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** بالاتر از مودال‌های معمولی — برای مودال تودرتو مثل انتخاب موقعیت روی نقشه */
  elevated?: boolean;
  /** کنار دکمه بستن در سمت چپ هدر (RTL) */
  headerActions?: ReactNode;
  /** موقعیت مودال در موبایل — پیش‌فرض پایین (bottom sheet) */
  mobilePlacement?: 'top' | 'bottom';
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  elevated = false,
  headerActions,
  mobilePlacement = 'bottom',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth =
    size === 'xl'
      ? 'max-w-5xl'
      : size === 'lg'
        ? 'max-w-2xl'
        : size === 'sm'
          ? 'max-w-sm'
          : 'max-w-lg';

  const overlayMobileAlign =
    mobilePlacement === 'top'
      ? 'items-start pt-[max(0.5rem,env(safe-area-inset-top))]'
      : 'items-end';

  const panelMobileRadius =
    mobilePlacement === 'top'
      ? 'rounded-b-2xl sm:rounded-2xl'
      : 'rounded-t-2xl sm:rounded-2xl';

  return (
    <div
      className={`fixed inset-0 flex ${overlayMobileAlign} justify-center sm:items-center sm:p-4 ${elevated ? 'z-[60]' : 'z-50'}`}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 flex max-h-[92dvh] w-full flex-col bg-white shadow-xl sm:max-h-[90vh] ${panelMobileRadius} ${maxWidth}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
          <h2 className="text-base font-bold text-slate-800 sm:text-lg">{title}</h2>
          <div className="flex items-center gap-2">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="بستن"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
