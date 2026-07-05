import { useEffect, useState, type KeyboardEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { PilgrimListDownloadButton } from "../components/pilgrims/PilgrimListDownloadButton";
import { PilgrimListPrintButton } from "../components/pilgrims/PilgrimListPrintButton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { MawkibFilterSelect } from "../components/mawkibs/MawkibFilterSelect";
import { UserFormModal } from "../components/users/UserFormModal";
import { UserAvatar, UserNameWithAvatar } from "../components/users/UserAvatar";
import { DataCard } from "../components/ui/DataCard";
import { FilterPanel } from "../components/ui/FilterPanel";
import { PageHeader } from "../components/ui/PageHeader";
import { ProvinceCitySelect } from "../components/ui/ProvinceCitySelect";
import { PaginationBar } from "../components/ui/PaginationBar";
import { toast, toastApiError } from "../lib/toast";
import { useRoleAccess } from "../hooks/useRoleAccess";
import { btnAction, btnPrimary, filterInputClass } from "../lib/styles";
import {
  DEFAULT_PILGRIMS_PAGE_SIZE,
  usersApi,
  type CreateQuickPilgrimPayload,
  type UpdateUserPayload,
  type UserListFilters,
} from "../lib/users";
import type { AdminUser } from "../types";
import { userGenderLabel } from "../lib/user-gender";
import { formatPersianDate } from "../components/ui/PersianDateInput";

const emptyFilters = {
  fullName: "",
  mobileNumber: "",
  nationalId: "",
  province: "",
  city: "",
  mawkibIdStr: "",
};

function formatBirthDate(value?: string | null) {
  if (!value) return "—";
  return formatPersianDate(value.slice(0, 10));
}

function toApiFilters(form: typeof emptyFilters): UserListFilters {
  const filters: UserListFilters = {};
  if (form.fullName) filters.fullName = form.fullName;
  if (form.mobileNumber) filters.mobileNumber = form.mobileNumber;
  if (form.nationalId) filters.nationalId = form.nationalId;
  if (form.province) filters.province = form.province;
  if (form.city) filters.city = form.city;
  if (form.mawkibIdStr) filters.mawkibId = parseInt(form.mawkibIdStr, 10);
  return filters;
}

function buildInitialAppliedFilters(mawkibId: string): UserListFilters {
  const filters: UserListFilters = {};
  if (mawkibId) filters.mawkibId = parseInt(mawkibId, 10);
  return filters;
}

export function PilgrimsPage() {
  const { isAdmin, isMawkibOwner } = useRoleAccess();
  const [searchParams] = useSearchParams();
  const initialMawkibId = searchParams.get("mawkibId") ?? "";
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    ...emptyFilters,
    mawkibIdStr: initialMawkibId,
  });
  const [appliedFilters, setAppliedFilters] = useState<UserListFilters>(() =>
    buildInitialAppliedFilters(initialMawkibId),
  );
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, mawkibIdStr: initialMawkibId }));
    setAppliedFilters(buildInitialAppliedFilters(initialMawkibId));
    setPage(1);
  }, [initialMawkibId]);

  const {
    data: pilgrimsPage,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pilgrims-list", appliedFilters, page],
    queryFn: () =>
      usersApi.getPilgrimsPaginated({
        ...appliedFilters,
        page,
        pageSize: DEFAULT_PILGRIMS_PAGE_SIZE,
      }),
  });

  const pilgrims = pilgrimsPage?.items ?? [];
  const totalPilgrims = pilgrimsPage?.total ?? 0;
  const totalPages = pilgrimsPage?.totalPages ?? 1;

  const loadPilgrimsForExport = () =>
    usersApi.getPilgrimsForExport(appliedFilters);

  const createMutation = useMutation({
    mutationFn: usersApi.createQuickPilgrim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilgrims-list"] });
      queryClient.invalidateQueries({ queryKey: ["pilgrims"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("زائر با موفقیت ثبت شد");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pilgrims-list"] });
      queryClient.invalidateQueries({ queryKey: ["pilgrims"] });
      toast.success("زائر با موفقیت ویرایش شد");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["pilgrims-list"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUser(null);
      toast.success(result.message);
    },
    onError: (error) => {
      toastApiError(error, "خطا در حذف زائر");
    },
  });

  const applyFilters = () => {
    const next = toApiFilters(filters);
    setPage(1);
    if (JSON.stringify(next) === JSON.stringify(appliedFilters)) {
      void refetch();
      return;
    }
    setAppliedFilters(next);
  };

  const openEditUser = (pilgrim: AdminUser) => {
    setEditingUser(pilgrim);
    setFormOpen(true);
  };

  const handlePilgrimRowClick = (pilgrim: AdminUser) => {
    if (isAdmin || isMawkibOwner) {
      openEditUser(pilgrim);
    }
  };

  const handleFilterEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyFilters();
  };

  const resetFilters = () => {
    setFilters(emptyFilters);
    setPage(1);
    if (Object.keys(appliedFilters).length === 0) {
      void refetch();
      return;
    }
    setAppliedFilters({});
  };

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
      {(isAdmin || isMawkibOwner) && (
        <button
          onClick={() => openEditUser(pilgrim)}
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
        title={isAdmin ? "زائرین" : "زائرین موکب‌های من"}
        subtitle={
          isAdmin
            ? "مدیریت کاربران — زائرین"
            : "نمایش اطلاعاتی زائرینی که موکب شما را در گذشته رزرو کرده اند "
        }
        action={
          isAdmin ? (
            <button
              onClick={() => {
                setEditingUser(null);
                setFormOpen(true);
              }}
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              + افزودن زائر
            </button>
          ) : undefined
        }
      />

      <FilterPanel onApply={applyFilters} onReset={resetFilters}>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {isMawkibOwner && !isAdmin && (
            <MawkibFilterSelect
              value={filters.mawkibIdStr}
              onChange={(mawkibIdStr) =>
                setFilters((prev) => ({ ...prev, mawkibIdStr }))
              }
            />
          )}
          <input
            type="text"
            placeholder="نام"
            value={filters.fullName}
            onChange={(e) =>
              setFilters({ ...filters, fullName: e.target.value })
            }
            onKeyDown={handleFilterEnter}
            className={filterInputClass}
          />
          <input
            type="text"
            placeholder="موبایل"
            value={filters.mobileNumber}
            onChange={(e) =>
              setFilters({ ...filters, mobileNumber: e.target.value })
            }
            onKeyDown={handleFilterEnter}
            className={filterInputClass}
          />
          <input
            type="text"
            placeholder="کد ملی"
            value={filters.nationalId}
            onChange={(e) =>
              setFilters({ ...filters, nationalId: e.target.value })
            }
            onKeyDown={handleFilterEnter}
            className={filterInputClass}
            dir="ltr"
            inputMode="numeric"
          />
          <div className="sm:col-span-2">
            <ProvinceCitySelect
              compact
              province={filters.province}
              city={filters.city}
              onProvinceChange={(province) =>
                setFilters((prev) => ({ ...prev, province, city: "" }))
              }
              onCityChange={(city) => setFilters((prev) => ({ ...prev, city }))}
            />
          </div>
        </div>
      </FilterPanel>

      <div className="mb-4 flex justify-end gap-2">
        <PilgrimListDownloadButton
          loadPilgrims={loadPilgrimsForExport}
          disabled={isLoading}
        />
        <PilgrimListPrintButton
          loadPilgrims={loadPilgrimsForExport}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3 lg:hidden">
        {pilgrims.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
            زائری یافت نشد
          </p>
        ) : (
          pilgrims.map((pilgrim) => (
            <DataCard
              key={pilgrim.id}
              leading={
                <UserAvatar
                  fullName={pilgrim.fullName}
                  imageUrl={pilgrim.imageUrl}
                  size="sm"
                />
              }
              title={pilgrim.fullName}
              subtitle={pilgrim.mobileNumber}
              className={
                isAdmin || isMawkibOwner
                  ? "cursor-pointer transition hover:border-slate-200 hover:bg-slate-50/80"
                  : undefined
              }
              onClick={() => handlePilgrimRowClick(pilgrim)}
              badge={
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                    pilgrim.isActive
                      ? "bg-[#e8eef6] text-[#3d5d8a]"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {pilgrim.isActive ? "فعال" : "غیرفعال"}
                </span>
              }
              rows={[
                { label: "کد ملی", value: pilgrim.nationalId ?? "—" },
                { label: "جنسیت", value: userGenderLabel(pilgrim.gender) },
                { label: "تاریخ تولد", value: formatBirthDate(pilgrim.birthDate) },
                { label: "شهر", value: pilgrim.city ?? "—" },
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
              <th className="px-4 py-3 text-right">کد ملی</th>
              <th className="px-4 py-3 text-right">جنسیت</th>
              <th className="px-4 py-3 text-right">تاریخ تولد</th>
              <th className="px-4 py-3 text-right">شهر</th>
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {pilgrims.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  زائری یافت نشد
                </td>
              </tr>
            ) : (
              pilgrims.map((pilgrim) => (
                <tr
                  key={pilgrim.id}
                  className={
                    isAdmin || isMawkibOwner
                      ? "cursor-pointer border-t border-slate-100 transition hover:bg-slate-50/80"
                      : "border-t border-slate-100"
                  }
                  onClick={() => handlePilgrimRowClick(pilgrim)}
                >
                  <td className="px-4 py-3">
                    <UserNameWithAvatar
                      fullName={pilgrim.fullName}
                      imageUrl={pilgrim.imageUrl}
                      avatarSize="sm"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {pilgrim.mobileNumber}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {pilgrim.nationalId ?? "—"}
                  </td>
                  <td className="px-4 py-3">{userGenderLabel(pilgrim.gender)}</td>
                  <td className="px-4 py-3">{formatBirthDate(pilgrim.birthDate)}</td>
                  <td className="px-4 py-3">{pilgrim.city ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        pilgrim.isActive
                          ? "bg-[#e8eef6] text-[#3d5d8a]"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {pilgrim.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-wrap gap-2">
                      {renderActions(pilgrim)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        className="mt-4"
        page={page}
        totalPages={totalPages}
        totalItems={totalPilgrims}
        pageSize={DEFAULT_PILGRIMS_PAGE_SIZE}
        onPageChange={setPage}
      />

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
            await createMutation.mutateAsync(
              payload as CreateQuickPilgrimPayload,
            );
          }
        }}
        user={editingUser}
        fixedRole="Pilgrim"
        quickPilgrim={!editingUser}
        pilgrimCardOwnerScope={isMawkibOwner && !isAdmin}
      />

      <ConfirmDialog
        open={!!deletingUser && isAdmin}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
        title="حذف زائر"
        message={
          deletingUser
            ? `آیا از حذف «${deletingUser.fullName}» مطمئن هستید؟`
            : ""
        }
        confirmLabel="حذف"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
