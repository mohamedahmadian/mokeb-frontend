import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UserFormModal } from '../components/users/UserFormModal';
import { DataCard } from '../components/ui/DataCard';
import { FilterPanel } from '../components/ui/FilterPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { ProvinceCitySelect } from '../components/ui/ProvinceCitySelect';
import { MAWKIB_STATUS_LABELS, getApiErrorMessage } from '../lib/constants';
import { btnAction, btnPrimary, filterInputClass } from '../lib/styles';
import {
  usersApi,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserListFilters,
} from '../lib/users';
import type { AdminUser } from '../types';

const emptyFilters = {
  fullName: '',
  mobileNumber: '',
  province: '',
  city: '',
  isActiveStr: '',
};

function toApiFilters(form: typeof emptyFilters): UserListFilters {
  const filters: UserListFilters = { role: 'MawkibOwner' };
  if (form.fullName) filters.fullName = form.fullName;
  if (form.mobileNumber) filters.mobileNumber = form.mobileNumber;
  if (form.province) filters.province = form.province;
  if (form.city) filters.city = form.city;
  if (form.isActiveStr === 'true') filters.isActive = true;
  if (form.isActiveStr === 'false') filters.isActive = false;
  return filters;
}

function approvedMawkibs(owner: AdminUser) {
  return owner.ownedMawkibs?.filter((m) => m.status === 'Approved') ?? [];
}

export function MawkibOwnersPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<UserListFilters>({
    role: 'MawkibOwner',
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const { data: owners = [], isLoading } = useQuery({
    queryKey: ['mawkib-owners-list', appliedFilters],
    queryFn: () => usersApi.getMawkibOwners(appliedFilters),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mawkib-owners-list'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFeedback({ type: 'success', text: 'موکب‌دار با موفقیت ثبت شد' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mawkib-owners-list'] });
      setFeedback({ type: 'success', text: 'موکب‌دار با موفقیت ویرایش شد' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['mawkib-owners-list'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
      setFeedback({ type: 'success', text: result.message });
    },
    onError: (error) => {
      setFeedback({
        type: 'error',
        text: getApiErrorMessage(error, 'خطا در حذف موکب‌دار'),
      });
    },
  });

  const renderReserveButtons = (owner: AdminUser) => {
    const mawkibs = approvedMawkibs(owner);
    if (mawkibs.length === 0) {
      return (
        <span className="text-xs text-slate-400">موکب تاییدشده‌ای ندارد</span>
      );
    }
    return mawkibs.map((m) => (
      <Link
        key={m.id}
        to={`/reservations/new?mawkibId=${m.id}`}
        className={`${btnAction} bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6]`}
      >
        {mawkibs.length > 1 ? `رزرو — ${m.name}` : 'رزرو'}
      </Link>
    ));
  };

  const renderActions = (owner: AdminUser) => (
    <>
      <Link
        to={`/mawkibs?ownerUserId=${owner.id}`}
        className={`${btnAction} bg-blue-50 text-blue-700 hover:bg-blue-100`}
      >
        مدیریت موکب‌ها
      </Link>
      {renderReserveButtons(owner)}
      <button
        onClick={() => {
          setEditingUser(owner);
          setFormOpen(true);
        }}
        className={`${btnAction} bg-slate-100 text-slate-700 hover:bg-slate-200`}
      >
        ویرایش
      </button>
      <button
        onClick={() => setDeletingUser(owner)}
        className={`${btnAction} bg-red-50 text-red-600 hover:bg-red-100`}
      >
        حذف
      </button>
    </>
  );

  const mawkibsSummary = (owner: AdminUser) => {
    const list = owner.ownedMawkibs ?? [];
    if (list.length === 0) return '—';
    return (
      <div className="flex flex-wrap justify-end gap-1">
        {list.map((m) => (
          <span key={m.id} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
            {m.name} ({MAWKIB_STATUS_LABELS[m.status]})
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) return <p className="text-slate-500">در حال بارگذاری...</p>;

  return (
    <div>
      <PageHeader
        title="موکب‌داران"
        subtitle="مدیریت کاربران — موکب‌داران"
        action={
          <button
            onClick={() => {
              setEditingUser(null);
              setFormOpen(true);
            }}
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            + افزودن موکب‌دار
          </button>
        }
      />

      {feedback && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-[#f0f4fa] text-[#3d5d8a]'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {feedback.text}
          <button onClick={() => setFeedback(null)} className="mr-3 text-xs underline">
            بستن
          </button>
        </div>
      )}

      <FilterPanel
        onApply={() => setAppliedFilters(toApiFilters(filters))}
        onReset={() => {
          setFilters(emptyFilters);
          setAppliedFilters({ role: 'MawkibOwner' });
        }}
      >
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            placeholder="نام"
            value={filters.fullName}
            onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
            className={filterInputClass}
          />
          <input
            type="text"
            placeholder="موبایل"
            value={filters.mobileNumber}
            onChange={(e) => setFilters({ ...filters, mobileNumber: e.target.value })}
            className={filterInputClass}
          />
          <div className="sm:col-span-2">
            <ProvinceCitySelect
              compact
              province={filters.province}
              city={filters.city}
              onProvinceChange={(province) =>
                setFilters((prev) => ({ ...prev, province, city: '' }))
              }
              onCityChange={(city) => setFilters((prev) => ({ ...prev, city }))}
            />
          </div>
          <select
            value={filters.isActiveStr}
            onChange={(e) => setFilters({ ...filters, isActiveStr: e.target.value })}
            className={filterInputClass}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
        </div>
      </FilterPanel>

      <div className="space-y-3 lg:hidden">
        {owners.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
            موکب‌داری یافت نشد
          </p>
        ) : (
          owners.map((owner) => (
            <DataCard
              key={owner.id}
              title={owner.fullName}
              subtitle={owner.mobileNumber}
              badge={
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    owner.isActive
                      ? 'bg-[#e8eef6] text-[#3d5d8a]'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {owner.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              }
              rows={[
                { label: 'استان', value: owner.province ?? '—' },
                { label: 'شهر', value: owner.city ?? '—' },
                { label: 'موکب‌ها', value: mawkibsSummary(owner) },
              ]}
              actions={renderActions(owner)}
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
              <th className="px-4 py-3 text-right">استان</th>
              <th className="px-4 py-3 text-right">شهر</th>
              <th className="px-4 py-3 text-right">موکب‌ها</th>
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {owners.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  موکب‌داری یافت نشد
                </td>
              </tr>
            ) : (
              owners.map((owner) => (
                <tr key={owner.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{owner.fullName}</td>
                  <td className="px-4 py-3 font-mono">{owner.mobileNumber}</td>
                  <td className="px-4 py-3">{owner.province ?? '—'}</td>
                  <td className="px-4 py-3">{owner.city ?? '—'}</td>
                  <td className="px-4 py-3">{mawkibsSummary(owner)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        owner.isActive
                          ? 'bg-[#e8eef6] text-[#3d5d8a]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {owner.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">{renderActions(owner)}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingUser(null);
        }}
        onSubmit={async (payload) => {
          if (editingUser) {
            await updateMutation.mutateAsync({
              id: editingUser.id,
              payload: payload as UpdateUserPayload,
            });
          } else {
            await createMutation.mutateAsync(payload as CreateUserPayload);
          }
        }}
        user={editingUser}
        fixedRole="MawkibOwner"
      />

      <ConfirmDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
        title="حذف موکب‌دار"
        message={
          deletingUser
            ? `آیا از حذف «${deletingUser.fullName}» مطمئن هستید؟`
            : ''
        }
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
