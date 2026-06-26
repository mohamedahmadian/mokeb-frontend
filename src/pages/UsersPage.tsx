import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { UserFormModal } from '../components/users/UserFormModal';
import { DataCard } from '../components/ui/DataCard';
import { FilterPanel } from '../components/ui/FilterPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { ProvinceCitySelect } from '../components/ui/ProvinceCitySelect';
import { ROLE_LABELS, ROLE_OPTIONS, getApiErrorMessage } from '../lib/constants';
import { toast, toastApiError } from '../lib/toast';
import { btnPrimary, btnAction, filterInputClass } from '../lib/styles';
import { usersApi, type UserListFilters } from '../lib/users';
import type { AdminUser, RoleName } from '../types';
import type { CreateUserPayload, UpdateUserPayload } from '../lib/users';

const emptyFilters = {
  fullName: '',
  mobileNumber: '',
  province: '',
  city: '',
  role: '' as RoleName | '',
};

function toApiFilters(form: typeof emptyFilters): UserListFilters {
  const filters: UserListFilters = {};
  if (form.fullName) filters.fullName = form.fullName;
  if (form.mobileNumber) filters.mobileNumber = form.mobileNumber;
  if (form.province) filters.province = form.province;
  if (form.city) filters.city = form.city;
  if (form.role) filters.role = form.role;
  return filters;
}

export function UsersPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<UserListFilters>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', appliedFilters],
    queryFn: () => usersApi.getAll(appliedFilters),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('کاربر با موفقیت ایجاد شد');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('کاربر با موفقیت ویرایش شد');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeletingUser(null);
      toast.success(result.message);
    },
    onError: (error) => {
      toastApiError(error, 'خطا در حذف کاربر');
    },
  });

  const openCreate = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleFormSubmit = async (
    payload: CreateUserPayload | UpdateUserPayload,
  ) => {
    try {
      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser.id,
          payload: payload as UpdateUserPayload,
        });
      } else {
        await createMutation.mutateAsync(payload as CreateUserPayload);
      }
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'خطا در ذخیره کاربر'));
    }
  };

  const renderActions = (user: AdminUser) => (
    <>
      <button
        onClick={() => openEdit(user)}
        className={`${btnAction} bg-slate-100 text-slate-700 hover:bg-slate-200`}
      >
        ویرایش
      </button>
      <button
        onClick={() => setDeletingUser(user)}
        className={`${btnAction} bg-red-50 text-red-600 hover:bg-red-100`}
      >
        حذف
      </button>
    </>
  );

  if (isLoading) return <p className="text-slate-500">در حال بارگذاری...</p>;

  return (
    <div>
      <PageHeader
        title="مدیریت کاربران"
        action={
          <button onClick={openCreate} className={`${btnPrimary} w-full sm:w-auto`}>
            + افزودن کاربر
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
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="نام و نام خانوادگی"
            value={filters.fullName}
            onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
            className={filterInputClass}
          />
          <input
            type="text"
            placeholder="تلفن همراه"
            value={filters.mobileNumber}
            onChange={(e) => setFilters({ ...filters, mobileNumber: e.target.value })}
            className={filterInputClass}
          />
          <select
            value={filters.role}
            onChange={(e) =>
              setFilters({
                ...filters,
                role: (e.target.value || '') as RoleName | '',
              })
            }
            className={filterInputClass}
          >
            <option value="">همه نقش‌ها</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <div className="sm:col-span-2 lg:col-span-1">
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
        </div>
      </FilterPanel>

      <div className="space-y-3 lg:hidden">
        {users.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
            کاربری یافت نشد
          </p>
        ) : (
          users.map((user) => (
            <DataCard
              key={user.id}
              title={user.fullName}
              subtitle={user.mobileNumber}
              badge={
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    user.isActive
                      ? 'bg-[#e8eef6] text-[#3d5d8a]'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {user.isActive ? 'فعال' : 'غیرفعال'}
                </span>
              }
              rows={[
                { label: 'استان', value: user.province ?? '—' },
                { label: 'شهر', value: user.city ?? '—' },
                {
                  label: 'نقش‌ها',
                  value: (
                    <div className="flex flex-wrap justify-end gap-1">
                      {user.roles.map((r) => (
                        <span
                          key={r.role.name}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs"
                        >
                          {ROLE_LABELS[r.role.name] ?? r.role.name}
                        </span>
                      ))}
                    </div>
                  ),
                },
              ]}
              actions={renderActions(user)}
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
              <th className="px-4 py-3 text-right">نقش‌ها</th>
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  کاربری یافت نشد
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{user.fullName}</td>
                  <td className="px-4 py-3 font-mono">{user.mobileNumber}</td>
                  <td className="px-4 py-3">{user.province ?? '—'}</td>
                  <td className="px-4 py-3">{user.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <span
                          key={r.role.name}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs"
                        >
                          {ROLE_LABELS[r.role.name] ?? r.role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        user.isActive
                          ? 'bg-[#e8eef6] text-[#3d5d8a]'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">{renderActions(user)}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
      />

      <ConfirmDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
        title="حذف کاربر"
        message={
          deletingUser
            ? `آیا از حذف «${deletingUser.fullName}» مطمئن هستید؟ اگر کاربر سوابق فعال داشته باشد، غیرفعال می‌شود.`
            : ''
        }
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
