import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DataCard } from '../components/ui/DataCard';
import { PageHeader } from '../components/ui/PageHeader';
import { formatPersianDateRange } from '../components/ui/PersianDateRangePicker';
import { formatPersianDate } from '../components/ui/PersianDateInput';
import {
  HonoraryVolunteerForm,
  applicationToFormValues,
  type HonoraryVolunteerFormValues,
} from '../components/honorary-volunteers/HonoraryVolunteerForm';
import { HonoraryVolunteerApplicationViewModal } from '../components/honorary-volunteers/HonoraryVolunteerApplicationViewModal';
import { getServiceTypeLabel } from '../lib/honorary-volunteer';
import { honoraryVolunteersApi } from '../lib/honorary-volunteers';
import { getApiErrorMessage } from '../lib/constants';
import { btnDanger, btnPrimary, btnSecondary } from '../lib/styles';
import type { HonoraryVolunteerApplication } from '../types';

const statusLabels: Record<string, string> = {
  Pending: 'در انتظار',
  Approved: 'تایید شده',
  Rejected: 'رد شده',
  Cancelled: 'لغو شده',
};

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-[#e8eef6] text-[#3d5d8a]',
  Rejected: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-100 text-slate-600',
};

function serviceTypesSummary(types: string[]) {
  if (types.length === 0) return '—';
  const labels = types.map(getServiceTypeLabel);
  if (labels.length <= 2) return labels.join('، ');
  return `${labels.slice(0, 2).join('، ')} و ${labels.length - 2} مورد دیگر`;
}

function renderBadge(status: string) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export function MyHonoraryVolunteerApplicationsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<HonoraryVolunteerApplication | null>(null);
  const [viewing, setViewing] = useState<HonoraryVolunteerApplication | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['honorary-volunteer-my'],
    queryFn: () => honoraryVolunteersApi.listMy(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => honoraryVolunteersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['honorary-volunteer-my'] });
      setViewing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: HonoraryVolunteerFormValues }) =>
      honoraryVolunteersApi.update(id, {
        firstName: values.firstName,
        lastName: values.lastName,
        mobileNumber: values.mobileNumber,
        province: values.province || undefined,
        city: values.city || undefined,
        mawkibId: values.mawkibId ?? undefined,
        description: values.description || undefined,
        serviceTypes: values.serviceTypes,
        serviceDescription: values.serviceDescription || undefined,
        availabilityStartDate: values.availabilityStartDate,
        availabilityEndDate: values.availabilityEndDate,
        availabilityDescription: values.availabilityDescription || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['honorary-volunteer-my'] });
      setEditing(null);
    },
  });

  const renderActions = (app: HonoraryVolunteerApplication) => (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setViewing(app);
        }}
        className={btnSecondary}
      >
        جزئیات
      </button>
      {app.status === 'Pending' && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(app);
            }}
            className={btnPrimary}
          >
            ویرایش
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cancelMutation.mutate(app.id);
            }}
            className={btnDanger}
          >
            لغو
          </button>
        </>
      )}
    </div>
  );

  if (editing) {
    return (
      <div>
        <PageHeader title="ویرایش درخواست" />
        <HonoraryVolunteerForm
          embedded
          showPassword={false}
          title=""
          subtitle=""
          submitLabel="ذخیره تغییرات"
          initialValues={applicationToFormValues(editing)}
          onSubmit={async (values) => {
            try {
              await updateMutation.mutateAsync({ id: editing.id, values });
            } catch (err) {
              throw new Error(getApiErrorMessage(err, 'خطا در ویرایش'));
            }
          }}
        />
        <button type="button" className={`${btnSecondary} mt-4`} onClick={() => setEditing(null)}>
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="درخواست‌های خادم‌یاری من"
        action={
          <Link to="/guest/honorary-volunteer/register" className={`${btnPrimary} w-full sm:w-auto`}>
            ثبت درخواست جدید
          </Link>
        }
      />

      {isLoading ? (
        <p className="text-slate-500">در حال بارگذاری...</p>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {applications.length === 0 ? (
              <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
                هنوز درخواستی ثبت نکرده‌اید
              </p>
            ) : (
              applications.map((app) => (
                <DataCard
                  key={app.id}
                  title={app.trackingCode}
                  subtitle={formatPersianDate(app.createdAt.slice(0, 10))}
                  badge={renderBadge(app.status)}
                  onClick={() => setViewing(app)}
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
                    {
                      label: 'موکب',
                      value: app.mawkib?.name ?? '—',
                    },
                  ]}
                  actions={renderActions(app)}
                />
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-right">کد رهگیری</th>
                  <th className="px-4 py-3 text-right">تاریخ ثبت</th>
                  <th className="px-4 py-3 text-right">حوزه خدمت</th>
                  <th className="px-4 py-3 text-right">بازه همکاری</th>
                  <th className="px-4 py-3 text-right">موکب</th>
                  <th className="px-4 py-3 text-right">وضعیت</th>
                  <th className="px-4 py-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      هنوز درخواستی ثبت نکرده‌اید
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => setViewing(app)}
                      className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-[#4a6fa5]" dir="ltr">
                        {app.trackingCode}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatPersianDate(app.createdAt.slice(0, 10))}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3">
                        {serviceTypesSummary(app.serviceTypes)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatPersianDateRange(
                          app.availabilityStartDate.slice(0, 10),
                          app.availabilityEndDate.slice(0, 10),
                        )}
                      </td>
                      <td className="px-4 py-3">{app.mawkib?.name ?? '—'}</td>
                      <td className="px-4 py-3">{renderBadge(app.status)}</td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {renderActions(app)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <HonoraryVolunteerApplicationViewModal
        open={viewing !== null}
        application={viewing}
        onClose={() => setViewing(null)}
        onEdit={setEditing}
        onCancel={(id) => cancelMutation.mutate(id)}
        cancelling={cancelMutation.isPending}
      />
    </div>
  );
}
