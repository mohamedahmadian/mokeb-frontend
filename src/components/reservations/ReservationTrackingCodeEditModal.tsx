import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../Modal';
import { NavIcon } from '../ui/NavIcons';
import { btnSecondary, inputClass } from '../../lib/styles';

interface ReservationTrackingCodeEditModalProps {
  open: boolean;
  onClose: () => void;
  currentTrackingCode: string;
  onSubmit: (trackingCode: string) => Promise<void>;
}

export function ReservationTrackingCodeEditModal({
  open,
  onClose,
  currentTrackingCode,
  onSubmit,
}: ReservationTrackingCodeEditModalProps) {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTrackingCode('');
  }, [open, currentTrackingCode]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = trackingCode.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      await onSubmit(trimmed);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="تغییر کد رزرو" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-600">
            کد رزرو فعلی
          </label>
          <p
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-mono text-slate-800"
            dir="ltr"
          >
            {currentTrackingCode}
          </p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-slate-600">کد رزرو جدید</span>
          <input
            type="text"
            value={trackingCode}
            onChange={(event) => setTrackingCode(event.target.value)}
            className={`${inputClass} !min-h-9 font-mono`}
            dir="ltr"
            autoComplete="off"
            maxLength={64}
            placeholder="مثلاً 50415-2003"
            autoFocus
          />
        </label>

        <div className="flex justify-end border-t border-slate-100 pt-3">
          <button
            type="submit"
            disabled={
              loading ||
              !trackingCode.trim() ||
              trackingCode.trim() === currentTrackingCode
            }
            className={`${btnSecondary} inline-flex items-center justify-center gap-1.5 !min-h-9`}
          >
            <NavIcon name="track" className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {loading ? 'در حال ذخیره...' : 'تغییر کد رزرو'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
