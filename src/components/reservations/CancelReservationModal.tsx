import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { inputClass } from '../../lib/styles';
import { toast } from '../../lib/toast';

interface CancelReservationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  title?: string;
  description?: string;
  noteLabel?: string;
  submitLabel?: string;
}

export function CancelReservationModal({
  open,
  onClose,
  onSubmit,
  title = 'لغو رزرو',
  description = 'در صورت تمایل دلیل لغو را بنویسید تا برای زائر نمایش داده شود.',
  noteLabel = 'توضیحات لغو',
  submitLabel = 'لغو رزرو',
}: CancelReservationModalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setNote('');
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(note.trim());
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در لغو رزرو');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {description && <p className="text-sm text-slate-600">{description}</p>}
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">{noteLabel}</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="مثلاً به دلیل تکمیل ظرفیت..."
          />
        </label>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'در حال لغو...' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
