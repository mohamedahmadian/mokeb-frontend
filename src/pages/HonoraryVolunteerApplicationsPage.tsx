import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataCard } from '../components/ui/DataCard';
import { FilterPanel } from '../components/ui/FilterPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { PersianDateInput } from '../components/ui/PersianDateInput';
import { formatPersianDateRange } from '../components/ui/PersianDateRangePicker';
import { HonoraryVolunteerReviewModal } from '../components/honorary-volunteers/HonoraryVolunteerReviewModal';
import { useAuth } from '../contexts/AuthContext';
import {
  HONORARY_VOLUNTEER_SERVICE_OPTIONS,
  getServiceTypeLabel,
} from '../lib/honorary-volunteer';
import {
  honoraryVolunteersApi,
  type HonoraryVolunteerFilters,
} from '../lib/honorary-volunteers';
import { getApiErrorMessage } from '../lib/constants';
import { btnPrimary, filterInputClass } from '../lib/styles';
import type { HonoraryVolunteerApplication } from '../types';

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

const emptyFilters = {
  status: '',
  serviceType: '',
  search: '',
  availabilityFrom: '',
  availabilityTo: '',
  createdFrom: '',
  createdTo: '',
};

function parseFilters(form: typeof emptyFilters): HonoraryVolunteerFilters {
  const filters: HonoraryVolunteerFilters = {};
  if (form.status) filters.status = form.status as HonoraryVolunteerFilters['status'];
  if (form.serviceType) {
    filters.serviceType = form.serviceType as HonoraryVolunteerFilters['serviceType'];
  }
  if (form.search.trim()) filters.search = form.search.trim();
  if (form.availabilityFrom) filters.availabilityFrom = form.availabilityFrom;
  if (form.availabilityTo) filters.availabilityTo = form.availabilityTo;
  if (form.createdFrom) filters.createdFrom = form.createdFrom;
  if (form.createdTo) filters.createdTo = form.createdTo;
  return filters;
}

function serviceTypesSummary(types: string[]) {
  if (types.length === 0) return '—';
  const labels = types.map(getServiceTypeLabel);
  if (labels.length <= 2) return labels.join('، ');
  return `${labels.slice(0, 2).join('، ')} و ${labels.length - 2} مورد دیگر`;
}

export function HonoraryVolunteerApplicationsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const createdCode = searchParams.get('created');
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<HonoraryVolunteerFilters>({});
  const [selected, setSelected] = useState<HonoraryVolunteerApplication | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['honorary-volunteer-applications', appliedFilters],
    queryFn: () => honoraryVolunteersApi.list(appliedFilters),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reviewNote,
    }: {
      id: number;
      status: 'Approved' | 'Rejected';
      reviewNote: string;
    }) => honoraryVolunteersApi.review(id, { status, reviewNote: reviewNote || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['honorary-volunteer-applications'] });
      queryClient.invalidateQueries({ queryKey: ['honorary-volunteer-needs'] });
    },
  });

  const handleReview = async (
    id: number,
    status: 'Approved' | 'Rejected',
    reviewNote: string,
  ) => {
    try {
      await reviewMutation.mutateAsync({ id, status, reviewNote });
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'خطا در ثبت بررسی'));
    }
  };

  const renderBadge = (status: string) => (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );

  return (
    <div>
      <PageHeader
        title="درخواست‌های همکاری"
        action={
          isMawkibOwner ? (
            <Link to="/honorary-volunteers/new" className={`${btnPrimary} w-full sm:w-auto`}>
              درخواست خادم جدید
            </Link>
          ) : undefined
        }
      />

      {createdCode && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#c5d4e8] bg-[#f0f4fa] p-4 text-sm text-[#3d5d8a] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>
              درخواست خادم با موفقیت ثبت شد. کد رهگیری:{' '}
              <span className="font-mono font-semibold" dir="ltr">
                {createdCode}
              </span>
            </p>
            <p className="mt-1 text-xs text-[#4a6fa5]">
              این درخواست در صفحه عمومی «نیازمندی‌های موکب‌ها» نمایش داده می‌شود.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              to="/guest/honorary-volunteer/needs"
              className={`${btnPrimary} text-xs`}
              target="_blank"
              rel="noreferrer"
            >
              مشاهده در سایت
            </Link>
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('created');
                setSearchParams(next, { replace: true });
              }}
              className="text-[#4a6fa5] hover:text-[#3d5d8a]"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      <FilterPanel
        onApply={() => setAppliedFilters(parseFilters(filters))}
        onReset={() => {
          setFilters(emptyFilters);
          setAppliedFilters({});
        }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">جستجو (نام یا موبایل)</span>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className={filterInputClass}
              placeholder="نام، نام خانوادگی یا موبایل"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">وضعیت</span>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className={filterInputClass}
            >
              <option value="">همه</option>
              <option value="Pending">در انتظار</option>
              <option value="Approved">تایید شده</option>
              <option value="Rejected">رد شده</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">حوزه خدمت</span>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters((f) => ({ ...f, serviceType: e.target.value }))}
              className={filterInputClass}
            >
              <option value="">همه</option>
              {HONORARY_VOLUNTEER_SERVICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">آمادگی از تاریخ</span>
            <PersianDateInput
              value={filters.availabilityFrom}
              onChange={(v) => setFilters((f) => ({ ...f, availabilityFrom: v }))}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">آمادگی تا تاریخ</span>
            <PersianDateInput
              value={filters.availabilityTo}
              onChange={(v) => setFilters((f) => ({ ...f, availabilityTo: v }))}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">ثبت از تاریخ</span>
            <PersianDateInput
              value={filters.createdFrom}
              onChange={(v) => setFilters((f) => ({ ...f, createdFrom: v }))}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">ثبت تا تاریخ</span>
            <PersianDateInput
              value={filters.createdTo}
              onChange={(v) => setFilters((f) => ({ ...f, createdTo: v }))}
            />
          </label>
        </div>
      </FilterPanel>

      {isLoading ? (
        <p className="text-slate-500">در حال بارگذاری...</p>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {applications.length === 0 ? (
              <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
                درخواستی یافت نشد
              </p>
            ) : (
              applications.map((app) => (
                <DataCard
                  key={app.id}
                  title={`${app.firstName} ${app.lastName}`}
                  subtitle={app.mobileNumber}
                  badge={renderBadge(app.status)}
                  onClick={() => setSelected(app)}
                  rows={[
                    {
                      label: 'حوزه خدمت',
                      value: serviceTypesSummary(app.serviceTypes),
                    },
                    {
                      label: 'بازه همکاری',
                      value: formatPersianDateRange(
                        app.availabilityStartDate.slice(0, 10),
                        app.availabilityEndDate.slice(0, 10),
                      ),
                    },
                  ]}
                />
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-right">نام</th>
                  <th className="px-4 py-3 text-right">موبایل</th>
                  <th className="px-4 py-3 text-right">حوزه خدمت</th>
                  <th className="px-4 py-3 text-right">بازه همکاری</th>
                  <th className="px-4 py-3 text-right">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      درخواستی یافت نشد
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => setSelected(app)}
                      className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {app.firstName} {app.lastName}
                      </td>
                      <td className="px-4 py-3 font-mono" dir="ltr">
                        {app.mobileNumber}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate">
                        {serviceTypesSummary(app.serviceTypes)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatPersianDateRange(
                          app.availabilityStartDate.slice(0, 10),
                          app.availabilityEndDate.slice(0, 10),
                        )}
                      </td>
                      <td className="px-4 py-3">{renderBadge(app.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <HonoraryVolunteerReviewModal
        open={selected !== null}
        application={selected}
        onClose={() => setSelected(null)}
        onReview={handleReview}
      />
    </div>
  );
}
