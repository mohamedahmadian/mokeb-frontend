import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MawkibFormModal } from '../components/mawkibs/MawkibFormModal';
import { MawkibOwnerFilterSelect } from '../components/mawkibs/MawkibOwnerFilterSelect';
import { DataCard } from '../components/ui/DataCard';
import { FilterPanel } from '../components/ui/FilterPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { ProvinceCitySelect } from '../components/ui/ProvinceCitySelect';
import { PersianDateInput, formatPersianDate } from '../components/ui/PersianDateInput';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage, MAWKIB_STATUS_LABELS, MAWKIB_STATUS_OPTIONS } from '../lib/constants';
import { toast, toastApiError } from '../lib/toast';
import { formatCapacityFraction, formatCapacityLine } from '../lib/capacity';
import { btnPrimary, btnAction, filterInputClass } from '../lib/styles';
import {
  mawkibsApi,
  type CreateMawkibPayload,
  type MawkibCapacityFilter,
  type MawkibFilters,
  type UpdateMawkibPayload,
} from '../lib/mawkibs';
import { usersApi } from '../lib/users';
import type { Mawkib } from '../types';

const emptyFilters: MawkibFilters = {
  name: '',
  phoneNumber: '',
  ownerUserId: undefined,
  status: undefined,
  province: '',
  city: '',
  serviceStartFrom: '',
  serviceEndTo: '',
};

function buildOwnerFilter(ownerUserId: string): MawkibFilters {
  if (!ownerUserId) return {};
  const id = parseInt(ownerUserId, 10);
  return Number.isNaN(id) ? {} : { ownerUserId: id };
}

export function MawkibsPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const isPilgrim = (user?.roles.includes('Pilgrim') ?? false) && !isAdmin && !isMawkibOwner;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialOwnerUserId = searchParams.get('ownerUserId') ?? '';

  const [filters, setFilters] = useState<MawkibFilters>(() => ({
    ...emptyFilters,
    ...buildOwnerFilter(initialOwnerUserId),
  }));
  const [appliedFilters, setAppliedFilters] = useState<MawkibFilters>(() =>
    buildOwnerFilter(initialOwnerUserId),
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingMawkib, setEditingMawkib] = useState<Mawkib | null>(null);
  const [deletingMawkib, setDeletingMawkib] = useState<Mawkib | null>(null);

  const { data: selectedOwner } = useQuery({
    queryKey: ['mawkib-owner-applied', appliedFilters.ownerUserId],
    queryFn: () => usersApi.getOne(appliedFilters.ownerUserId!),
    enabled: !!appliedFilters.ownerUserId,
  });

  useEffect(() => {
    if (!initialOwnerUserId) return;
    const ownerFilter = buildOwnerFilter(initialOwnerUserId);
    if (!ownerFilter.ownerUserId) return;
    setFilters((prev) => ({ ...prev, ownerUserId: ownerFilter.ownerUserId }));
    setAppliedFilters(ownerFilter);
  }, [initialOwnerUserId]);

  const capacityFilter =
    appliedFilters.capacityFilter === 'all' || !appliedFilters.capacityFilter
      ? undefined
      : appliedFilters.capacityFilter;

  const queryKey = isAdmin
    ? ['mawkibs-admin', appliedFilters]
    : isPilgrim
      ? ['mawkibs-public', appliedFilters]
      : ['mawkibs-my', appliedFilters];

  const { data: mawkibs = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      if (isAdmin) {
        return mawkibsApi.getAdminList({ ...appliedFilters, capacityFilter });
      }
      if (isPilgrim) {
        return mawkibsApi.getPublicList({
          name: appliedFilters.name,
          city: appliedFilters.city,
          province: appliedFilters.province,
          capacityFilter,
          serviceStartFrom: appliedFilters.serviceStartFrom,
          serviceEndTo: appliedFilters.serviceEndTo,
        });
      }
      return mawkibsApi.getMyList({ ...appliedFilters, capacityFilter });
    },
  });

  const canManageMawkibs = isAdmin || isMawkibOwner;

  const createMutation = useMutation({
    mutationFn: (payload: CreateMawkibPayload) => mawkibsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mawkibs-admin'] });
      queryClient.invalidateQueries({ queryKey: ['mawkibs-my'] });
      toast.success(
        isMawkibOwner && !isAdmin
          ? 'موکب ثبت شد و پس از تأیید مدیریت منتشر می‌شود'
          : 'موکب با موفقیت ایجاد شد',
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMawkibPayload }) =>
      mawkibsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mawkibs-admin'] });
      queryClient.invalidateQueries({ queryKey: ['mawkibs-my'] });
      toast.success('موکب با موفقیت ویرایش شد');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mawkibsApi.remove(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['mawkibs-admin'] });
      setDeletingMawkib(null);
      toast.success(result.message);
    },
    onError: (error) => {
      toastApiError(error, 'خطا در حذف موکب');
    },
  });

  const applyFilters = () => {
    const cleaned: MawkibFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        cleaned[key as keyof MawkibFilters] = value as never;
      }
    });
    setAppliedFilters(cleaned);
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters({});
  };

  const handleFormSubmit = async (
    payload: CreateMawkibPayload | UpdateMawkibPayload,
  ) => {
    try {
      if (editingMawkib) {
        await updateMutation.mutateAsync({
          id: editingMawkib.id,
          payload: payload as UpdateMawkibPayload,
        });
      } else {
        await createMutation.mutateAsync(payload as CreateMawkibPayload);
      }
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'خطا در ذخیره موکب'));
    }
  };

  const formatDate = (date?: string | null) =>
    date ? formatPersianDate(date.slice(0, 10)) : '—';

  const tableColSpan = isAdmin ? 9 : isPilgrim ? 7 : 8;

  const renderMaleCapacity = (mawkib: Mawkib) =>
    isPilgrim
      ? formatCapacityFraction(mawkib.availableMaleCapacity, mawkib.maleCapacity)
      : mawkib.maleCapacity;

  const renderFemaleCapacity = (mawkib: Mawkib) =>
    isPilgrim
      ? formatCapacityFraction(mawkib.availableFemaleCapacity, mawkib.femaleCapacity)
      : mawkib.femaleCapacity;

  const pilgrimCardRows = (mawkib: Mawkib) => [
    { label: 'تماس', value: <span className="font-mono">{mawkib.phoneNumber}</span> },
    {
      label: 'ظرفیت آقایان',
      value: formatCapacityFraction(mawkib.availableMaleCapacity, mawkib.maleCapacity),
    },
    {
      label: 'ظرفیت خانم‌ها',
      value: formatCapacityFraction(mawkib.availableFemaleCapacity, mawkib.femaleCapacity),
    },
    { label: 'شروع خدمات', value: formatDate(mawkib.serviceStartDate) },
    { label: 'پایان خدمات', value: formatDate(mawkib.serviceEndDate) },
  ];

  const adminOwnerCardRows = (mawkib: Mawkib) => [
    ...(isAdmin ? [{ label: 'مسئول', value: mawkib.owner?.fullName ?? '—' }] : []),
    { label: 'تماس', value: <span className="font-mono">{mawkib.phoneNumber}</span> },
    {
      label: 'ظرفیت کل',
      value: formatCapacityLine(
        {
          maleCapacity: mawkib.maleCapacity,
          femaleCapacity: mawkib.femaleCapacity,
          availableMale: mawkib.availableMaleCapacity ?? mawkib.maleCapacity,
          availableFemale: mawkib.availableFemaleCapacity ?? mawkib.femaleCapacity,
        },
        'total',
      ),
    },
    { label: 'شروع خدمات', value: formatDate(mawkib.serviceStartDate) },
    { label: 'پایان خدمات', value: formatDate(mawkib.serviceEndDate) },
  ];

  const renderActions = (mawkib: Mawkib) => (
    <>
      {mawkib.status === 'Approved' && (
        <button
          onClick={() =>
            navigate(
              isPilgrim
                ? `/reservations/new?mawkibId=${mawkib.id}`
                : `/reservations/new?mawkibId=${mawkib.id}`,
            )
          }
          className={`${btnAction} bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6]`}
        >
          رزرو
        </button>
      )}
      {!isPilgrim && (
        <>
          <button
            onClick={() => navigate(`/reservations?mawkibId=${mawkib.id}`)}
            className={`${btnAction} bg-blue-50 text-blue-700 hover:bg-blue-100`}
          >
            رزروها
          </button>
          <button
            onClick={() => {
              setEditingMawkib(mawkib);
              setFormOpen(true);
            }}
            className={`${btnAction} bg-slate-100 text-slate-700 hover:bg-slate-200`}
          >
            ویرایش
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeletingMawkib(mawkib)}
              className={`${btnAction} bg-red-50 text-red-600 hover:bg-red-100`}
            >
              حذف
            </button>
          )}
        </>
      )}
    </>
  );

  if (isLoading) return <p className="text-slate-500">در حال بارگذاری...</p>;

  const activeStatusLabel = appliedFilters.status
    ? MAWKIB_STATUS_LABELS[appliedFilters.status]
    : undefined;
  const pageSubtitle = selectedOwner
    ? `فیلتر فعال: موکب‌دار «${selectedOwner.fullName}»${
        activeStatusLabel ? ` · وضعیت: ${activeStatusLabel}` : ''
      }`
    : activeStatusLabel
      ? `فیلتر فعال: وضعیت «${activeStatusLabel}»`
      : undefined;

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'مدیریت موکب‌ها' : isPilgrim ? 'موکب‌ها' : 'موکب‌های من'}
        subtitle={pageSubtitle}
        action={
          canManageMawkibs ? (
            <button
              onClick={() => {
                setEditingMawkib(null);
                setFormOpen(true);
              }}
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              + افزودن موکب
            </button>
          ) : undefined
        }
      />

      <FilterPanel onApply={applyFilters} onReset={resetFilters}>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="نام موکب"
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className={filterInputClass}
          />
          {!isPilgrim && (
            <input
              type="text"
              placeholder="شماره تماس"
              value={filters.phoneNumber}
              onChange={(e) => setFilters({ ...filters, phoneNumber: e.target.value })}
              className={filterInputClass}
            />
          )}
          {isAdmin && (
            <MawkibOwnerFilterSelect
              value={filters.ownerUserId ? String(filters.ownerUserId) : ''}
              onChange={(ownerUserId) =>
                setFilters({
                  ...filters,
                  ownerUserId: ownerUserId ? Number(ownerUserId) : undefined,
                })
              }
            />
          )}
          {isAdmin && (
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">وضعیت</span>
              <select
                value={filters.status ?? ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    status: (e.target.value || undefined) as MawkibFilters['status'],
                  })
                }
                className={filterInputClass}
              >
                <option value="">همه وضعیت‌ها</option>
                {MAWKIB_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="sm:col-span-2">
            <ProvinceCitySelect
              compact
              province={filters.province ?? ''}
              city={filters.city ?? ''}
              onProvinceChange={(province) =>
                setFilters((prev) => ({ ...prev, province, city: '' }))
              }
              onCityChange={(city) => setFilters((prev) => ({ ...prev, city }))}
            />
          </div>
          <PersianDateInput
            compact
            placeholder="از تاریخ شروع خدمات"
            value={filters.serviceStartFrom ?? ''}
            onChange={(serviceStartFrom) =>
              setFilters({ ...filters, serviceStartFrom })
            }
          />
          <PersianDateInput
            compact
            placeholder="تا تاریخ پایان خدمات"
            value={filters.serviceEndTo ?? ''}
            onChange={(serviceEndTo) =>
              setFilters({ ...filters, serviceEndTo })
            }
          />
          <select
            value={filters.capacityFilter ?? ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                capacityFilter: (e.target.value || undefined) as
                  | MawkibCapacityFilter
                  | undefined,
              })
            }
            className={filterInputClass}
          >
            <option value="">نمایش کلیه موکب‌ها</option>
            <option value="available">موکب‌های خالی</option>
            <option value="full">موکب‌های بدون ظرفیت</option>
          </select>
        </div>
      </FilterPanel>

      <div className="space-y-3 lg:hidden">
        {mawkibs.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
            موکبی یافت نشد
          </p>
        ) : (
          mawkibs.map((mawkib) => (
            <DataCard
              key={mawkib.id}
              title={mawkib.name}
              rows={isPilgrim ? pilgrimCardRows(mawkib) : adminOwnerCardRows(mawkib)}
              actions={renderActions(mawkib)}
            />
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm lg:block">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right">نام موکب</th>
              {isAdmin && <th className="px-4 py-3 text-right">مسئول</th>}
              <th className="px-4 py-3 text-right">تماس</th>
              <th className="px-4 py-3 text-right">ظرفیت آقایان</th>
              <th className="px-4 py-3 text-right">ظرفیت خانم‌ها</th>
              <th className="px-4 py-3 text-right">شروع خدمات</th>
              <th className="px-4 py-3 text-right">پایان خدمات</th>
              <th className="px-4 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {mawkibs.length === 0 ? (
              <tr>
                <td colSpan={tableColSpan} className="px-4 py-8 text-center text-slate-400">
                  موکبی یافت نشد
                </td>
              </tr>
            ) : (
              mawkibs.map((mawkib) => (
                <tr key={mawkib.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{mawkib.name}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">{mawkib.owner?.fullName ?? '—'}</td>
                  )}
                  <td className="px-4 py-3 font-mono">{mawkib.phoneNumber}</td>
                  <td className="px-4 py-3 font-mono">{renderMaleCapacity(mawkib)}</td>
                  <td className="px-4 py-3 font-mono">{renderFemaleCapacity(mawkib)}</td>
                  <td className="px-4 py-3">{formatDate(mawkib.serviceStartDate)}</td>
                  <td className="px-4 py-3">{formatDate(mawkib.serviceEndDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">{renderActions(mawkib)}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <MawkibFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        mawkib={editingMawkib}
        isAdmin={isAdmin}
        currentUserId={user?.id}
      />

      {isAdmin && (
        <ConfirmDialog
          open={!!deletingMawkib}
          onClose={() => setDeletingMawkib(null)}
          onConfirm={() => deletingMawkib && deleteMutation.mutate(deletingMawkib.id)}
          title="حذف موکب"
          message={
            deletingMawkib
              ? `آیا از حذف «${deletingMawkib.name}» مطمئن هستید؟ اگر رزرو فعال داشته باشد، رد می‌شود.`
              : ''
          }
          confirmLabel="حذف"
          loading={deleteMutation.isPending}
          variant="danger"
        />
      )}
    </div>
  );
}
