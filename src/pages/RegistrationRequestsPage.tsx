import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DataCard } from '../components/ui/DataCard';
import { PageHeader } from '../components/ui/PageHeader';
import api from '../lib/api';
import { btnAction, btnDanger, btnPrimary } from '../lib/styles';
import type { RegistrationRequest } from '../types';

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

export function RegistrationRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['registration-requests'],
    queryFn: async () => {
      const { data } = await api.get<RegistrationRequest[]>('/registration-requests');
      return data;
    },
  });

  const review = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'Approved' | 'Rejected' }) =>
      api.patch(`/registration-requests/${id}/review`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registration-requests'] });
      queryClient.invalidateQueries({ queryKey: ['mawkibs-admin'] });
    },
  });

  const renderActions = (req: RegistrationRequest) =>
    req.status === 'Pending' ? (
      <>
        <button
          onClick={() => review.mutate({ id: req.id, status: 'Approved' })}
          className={`${btnAction} ${btnPrimary} !min-h-9 !px-2.5 !py-1.5 !text-xs`}
        >
          تایید
        </button>
        <button
          onClick={() => review.mutate({ id: req.id, status: 'Rejected' })}
          className={`${btnDanger} !min-h-9 !px-2.5 !py-1.5 !text-xs`}
        >
          رد
        </button>
      </>
    ) : null;

  if (isLoading) return <p className="text-slate-500">در حال بارگذاری...</p>;

  return (
    <div>
      <PageHeader title="درخواست‌های ثبت موکب" />

      <div className="space-y-3 lg:hidden">
        {requests.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
            درخواستی یافت نشد
          </p>
        ) : (
          requests.map((req) => (
            <DataCard
              key={req.id}
              title={req.mawkibName}
              subtitle={req.ownerName}
              badge={
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusColors[req.status]}`}
                >
                  {statusLabels[req.status]}
                </span>
              }
              rows={[
                { label: 'موبایل', value: <span className="font-mono">{req.phoneNumber}</span> },
                { label: 'ظرفیت', value: `${req.capacity} نفر` },
                { label: 'آدرس', value: req.address },
              ]}
              actions={renderActions(req)}
            />
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm lg:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right">نام موکب</th>
              <th className="px-4 py-3 text-right">مالک</th>
              <th className="px-4 py-3 text-right">موبایل</th>
              <th className="px-4 py-3 text-right">ظرفیت</th>
              <th className="px-4 py-3 text-right">آدرس</th>
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{req.mawkibName}</td>
                <td className="px-4 py-3">{req.ownerName}</td>
                <td className="px-4 py-3 font-mono">{req.phoneNumber}</td>
                <td className="px-4 py-3">{req.capacity} نفر</td>
                <td className="px-4 py-3 max-w-xs truncate">{req.address}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${statusColors[req.status]}`}
                  >
                    {statusLabels[req.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {req.status === 'Pending' && (
                    <div className="flex gap-2">{renderActions(req)}</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
