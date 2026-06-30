import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { NavIcon } from '../ui/NavIcons';
import { guestTheme } from '../../lib/guest-theme';
import { btnSecondary } from '../../lib/styles';

interface MawkibRulesAcceptanceModalProps {
  open: boolean;
  onClose: () => void;
  mawkibName: string;
  rules: string;
  submitting: boolean;
  onConfirm: () => void;
}

export function MawkibRulesAcceptanceModal({
  open,
  onClose,
  mawkibName,
  rules,
  submitting,
  onConfirm,
}: MawkibRulesAcceptanceModalProps) {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (open) setAccepted(false);
  }, [open, rules]);

  return (
    <Modal open={open} onClose={onClose} title="قوانین موکب" size="lg">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-slate-600">
          پیش از ثبت درخواست رزرو در موکب{' '}
          <span className="font-semibold text-[#4a6fa5]">{mawkibName}</span>،
          لطفاً قوانین زیر را با دقت مطالعه کنید.
        </p>

        <div className="overflow-hidden rounded-2xl border border-[#d4e0f0] bg-gradient-to-b from-[#f8fafc] to-white shadow-sm ring-1 ring-[#e8eef6]">
          <div className="flex items-center gap-2 border-b border-[#e8eef6] bg-[#f0f4fa] px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#4a6fa5] shadow-sm">
              <NavIcon name="book" className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">قوانین و مقررات</p>
              <p className="text-xs text-slate-500">{mawkibName}</p>
            </div>
          </div>
          <div className="max-h-[min(42vh,320px)] overflow-y-auto px-4 py-4">
            <p className="whitespace-pre-wrap text-sm leading-8 text-slate-700">
              {rules.trim()}
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 transition hover:bg-slate-50">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#4a6fa5] focus:ring-[#4a6fa5]"
          />
          <span className="text-sm leading-7 text-slate-700">
            قوانین موکب را مطالعه کرده‌ام و آن‌ها را می‌پذیرم.
          </span>
        </label>

        <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className={`${btnSecondary} sm:min-w-[120px]`}
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!accepted || submitting}
            className={`${guestTheme.btnPrimaryLg} flex-1 py-3 sm:min-w-[200px]`}
          >
            {submitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                در حال ثبت...
              </>
            ) : (
              'ثبت درخواست رزرو'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function hasMawkibRules(rules?: string | null): rules is string {
  return !!rules?.trim();
}
