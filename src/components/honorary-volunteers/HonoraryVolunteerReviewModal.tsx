import { useEffect, useState, type ReactNode } from 'react';
import { Modal } from '../Modal';
import { formatPersianDateRange } from '../ui/PersianDateRangePicker';
import { formatPersianDate } from '../ui/PersianDateInput';
import { getServiceTypeLabel } from '../../lib/honorary-volunteer';
import { btnDanger, btnPrimary, inputClass } from '../../lib/styles';
import { toast } from '../../lib/toast';
import type { HonoraryVolunteerApplication } from '../../types';

const statusLabels: Record<string, string> = {
  Pending: 'در انتظار',
  Approved: 'تایید شده',
  Rejected: 'رد شده',
};

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-[#e8eef6] text-[#3d5d8a]',
  Rejected: 'bg-red-100 text-red-700',
};

interface HonoraryVolunteerReviewModalProps {
  open: boolean;
  application: HonoraryVolunteerApplication | null;
  onClose: () => void;
  onReview: (
    id: number,
    status: 'Approved' | 'Rejected',
    reviewNote: string,
  ) => Promise<void>;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm leading-7 text-slate-800">{value}</dd>
    </div>
  );
}

export function HonoraryVolunteerReviewModal({
  open,
  application,
  onClose,
  onReview,
}: HonoraryVolunteerReviewModalProps) {
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReviewNote(application?.reviewNote ?? '');
  }, [open, application]);

  if (!application) return null;

  const fullName = `${application.firstName} ${application.lastName}`;
  const isPending = application.status === 'Pending';

  const handleReview = async (status: 'Approved' | 'Rejected') => {
    setLoading(true);
    try {
      await onReview(application.id, status, reviewNote.trim());
      toast.success(status === 'Approved' ? 'درخواست تایید شد' : 'درخواست رد شد');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در ثبت بررسی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="جزئیات درخواست خادم‌یاری" size="lg">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-slate-800">{fullName}</p>
            <p className="mt-0.5 font-mono text-sm text-slate-500" dir="ltr">
              {application.mobileNumber}
            </p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[application.status]}`}
          >
            {statusLabels[application.status]}
          </span>
        </div>

        <dl className="rounded-xl bg-slate-50 px-4">
          <DetailRow label="تاریخ ثبت" value={formatPersianDate(application.createdAt.slice(0, 10))} />
          <DetailRow label="توضیحات شخصی" value={application.description} />
          <DetailRow
            label="حوزه‌های خدمت"
            value={
              <div className="flex flex-wrap gap-1.5">
                {application.serviceTypes.map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-white px-2.5 py-0.5 text-xs ring-1 ring-slate-200"
                  >
                    {getServiceTypeLabel(type)}
                  </span>
                ))}
              </div>
            }
          />
          <DetailRow label="توضیحات خدمت" value={application.serviceDescription} />
          <DetailRow
            label="بازه آمادگی همکاری"
            value={formatPersianDateRange(
              application.availabilityStartDate.slice(0, 10),
              application.availabilityEndDate.slice(0, 10),
            )}
          />
          <DetailRow label="توضیحات زمان حضور" value={application.availabilityDescription} />
          {application.reviewedAt && (
            <DetailRow
              label="تاریخ بررسی"
              value={formatPersianDate(application.reviewedAt.slice(0, 10))}
            />
          )}
          {application.reviewedBy && (
            <DetailRow label="بررسی‌کننده" value={application.reviewedBy.fullName} />
          )}
        </dl>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">
            {isPending ? 'توضیحات بررسی' : 'یادداشت بررسی'}
          </span>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={3}
            readOnly={!isPending}
            className={`${inputClass} resize-none ${!isPending ? 'bg-slate-50' : ''}`}
            placeholder="توضیحات خود را درباره تایید یا رد درخواست بنویسید..."
          />
        </label>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            بستن
          </button>
          {isPending && (
            <>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleReview('Rejected')}
                className={`${btnDanger} w-full sm:w-auto`}
              >
                {loading ? 'در حال ثبت...' : 'رد درخواست'}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleReview('Approved')}
                className={`${btnPrimary} w-full sm:w-auto`}
              >
                {loading ? 'در حال ثبت...' : 'تایید درخواست'}
              </button>
            </>
          )}
        </div>

        {!isPending && application.reviewNote && (
          <p className="text-xs text-slate-400">
            این درخواست قبلاً بررسی شده و امکان تغییر وضعیت وجود ندارد.
          </p>
        )}
      </div>
    </Modal>
  );
}
