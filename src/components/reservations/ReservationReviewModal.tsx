import { useEffect, useState } from "react";
import { Modal } from "../Modal";
import { btnPrimary, btnSecondary, inputClass } from "../../lib/styles";
import { toast } from "../../lib/toast";
import type { Reservation } from "../../types";

interface ReservationReviewModalProps {
  open: boolean;
  onClose: () => void;
  reservation: Reservation;
  initialContent?: string;
  onSubmit: (content: string) => Promise<void>;
  isEdit?: boolean;
}

export function ReservationReviewModal({
  open,
  onClose,
  reservation,
  initialContent = "",
  onSubmit,
  isEdit = false,
}: ReservationReviewModalProps) {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setContent(initialContent);
  }, [open, initialContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("متن نظر را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در ثبت نظر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "ویرایش نظر" : "ثبت نظر"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          خوشحال می شیم که نظرتون رو در مورد اقامت در موکب «
          {reservation.mawkib.name}» با ما درمیون بذارین
        </p>
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">متن نظر *</span>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={2000}
            className={`${inputClass} resize-none`}
            placeholder="تجربه خود از اقامت، کیفیت خدمات و..."
          />
        </label>
        <p className="text-xs text-slate-400">
          {content.length.toLocaleString("fa-IR")} / ۲۰۰۰ کاراکتر
        </p>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={btnSecondary}>
            انصراف
          </button>
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? "در حال ذخیره..." : isEdit ? "ذخیره تغییرات" : "ثبت نظر"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
