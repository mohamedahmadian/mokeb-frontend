import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UserFormModal } from '../components/users/UserFormModal';
import { DataCard } from '../components/ui/DataCard';
import { FilterPanel } from '../components/ui/FilterPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { ProvinceCitySelect } from '../components/ui/ProvinceCitySelect';
import { toast, toastApiError } from '../lib/toast';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { btnAction, btnPrimary, filterInputClass } from '../lib/styles';
import { usersApi, type CreateQuickPilgrimPayload, type UpdateUserPayload, type UserListFilters } from '../lib/users';
import type { AdminUser } from '../types';

const emptyFilters = {
  fullName: '',
  mobileNumber: '',
  province: '',
  city: '',
  isActiveStr: '',
};

function toApiFilters(form: typeof emptyFilters): UserListFilters {
  const filters: UserListFilters = {};
  if (form.fullName) filters.fullName = form.fullName;
  if (form.mobileNumber) filters.mobileNumber = form.mobileNumber;
  if (form.province) filters.province = form.province;
  if (form.city) filters.city = form.city;
  if (form.isActiveStr === 'true') filters.isActive = true;
  if (form.isActiveStr === 'false') filters.isActive = false;
  return filters;
}

export function PilgrimsPage() {
  const { isAdmin } = useRoleAccess();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<UserListFilters>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const { data: pilgrims = [], isLoading } = useQuery({
    queryKey: ['pilgrims-list', appliedFilters],
    queryFn: () => usersApi.getPilgrims(appliedFilters),
  });

  const createMutation = useMutation({
    mutationFn: usersApi.createQuickPilgrim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilgrims-list'] });
      queryClient.invalidateQueries({ queryKey: ['pilgrims'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('زائر با موفقیت ثبت شد');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilgrims-list'] });
      queryClient.invalidateQueries({ queryKey: ['pilgrims'] });
      toast.success('زائر با موفقیت ویرایش شد');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['pilgrims-list'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
      toast.success(result.message);
    },
    onError: (error) => {
      toastApiError(error, 'خطا در حذف زائر');
    },
  });

  const renderActions = (pilgrim: AdminUser) => (
    <>
      <Link
        to={`/reservations?pilgrimUserId=${pilgrim.id}`}
        className={`${btnAction} bg-blue-50 text-blue-700 hover:bg-blue-100`}
      >
        تاریخچه
      </Link>
      <Link
        to={`/reservations/new?pilgrimUserId=${pilgrim.id}`}
        className={`${btnAction} bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6]`}
      >
        رزرو موکب
      </Link>
      {isAdmin && (
        <button
          onClick={() => {
            setEditingUser(pilgrim);
            setFormOpen(true);
          }}
          className={`${btnAction} bg-slate-100 text-slate-700 hover:bg-slate-200`}
        >
          ویرایش
        </button>
      )}
      {isAdmin && (
        <button
          onClick={() => setDeletingUser(pilgrim)}
          className={`${btnAction} bg-red-50 text-red-600 hover:bg-red-100`}
        >
          حذف
        </button>
      )}
    </>
  );

  if (isLoading) return <p className="text-slate-500">در حال بارگذاری...</p>;

  return (
    <div>
      <PageHeader
        title="زائرین"
        subtitle={isAdmin ? 'مدیریت کاربران — زائرین' : 'زائرین مرتبط با موکب‌های شما'}
        action={
          <button onClick={() => {
            setEditingUser(null);
            setFormOpen(true);
          }} className={`${btnPrimary} w-full sm:w-auto`}>
            + افزودن زائر
          </button>
        }
      />

      <FilterPanel
        onApply={() => setAppliedFilters(toApiFilters(filters))}
        onReset={() => {
          setFilters(emptyFilters);
          setAppliedFilters({});
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
        {pilgrims.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
            زائری یافت نشد
          </p>
        ) : (
          pilgrims.map((pilgrim) => (
            <DataCard
              key={pilgrim.id}
              title={pilgrim.fullName}
              subtitle={pilgrim.mobileNumber}
              badge={
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    pilgrim.isActive
                      ? 'bg-[#e8eef6] text-[#3d5d8a]'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {pilgrim.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              }
              rows={[
                { label: 'استان', value: pilgrim.province ?? '—' },
                { label: 'شهر', value: pilgrim.city ?? '—' },
              ]}
              actions={renderActions(pilgrim)}
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
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {pilgrims.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  زائری یافت نشد
                </td>
              </tr>
            ) : (
              pilgrims.map((pilgrim) => (
                <tr key={pilgrim.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{pilgrim.fullName}</td>
                  <td className="px-4 py-3 font-mono">{pilgrim.mobileNumber}</td>
                  <td className="px-4 py-3">{pilgrim.province ?? '—'}</td>
                  <td className="px-4 py-3">{pilgrim.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        pilgrim.isActive
                          ? 'bg-[#e8eef6] text-[#3d5d8a]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {pilgrim.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">{renderActions(pilgrim)}</div>
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
            await createMutation.mutateAsync(payload as CreateQuickPilgrimPayload);
          }
        }}
        user={editingUser}
        fixedRole="Pilgrim"
        quickPilgrim={!editingUser}
      />

      <ConfirmDialog
        open={!!deletingUser && isAdmin}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
        title="حذف زائر"
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
