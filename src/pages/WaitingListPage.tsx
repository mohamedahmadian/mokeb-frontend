import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CancelReservationModal } from '../components/reservations/CancelReservationModal';
import { MawkibFilterSelect } from '../components/mawkibs/MawkibFilterSelect';
import { MawkibCapacityPills } from '../components/mawkibs/MawkibInfoCard';
import { FilterPanel } from '../components/ui/FilterPanel';
import { NavIcon } from '../components/ui/NavIcons';
import { PageHeader } from '../components/ui/PageHeader';
import { PaginationBar } from '../components/ui/PaginationBar';
import {
  formatPersianDate,
  formatPersianDateTimeFromIso,
  PersianDateInput,
} from '../components/ui/PersianDateInput';
import { useAuth } from '../contexts/AuthContext';
import { GuestCountBadges } from '../components/reservations/GuestCountBadges';
import { getApiErrorMessage } from '../lib/constants';
import { toast } from '../lib/toast';
import {
  btnAction,
  btnDanger,
  btnPrimary,
  filterInputClass,
} from '../lib/styles';
import {
  reservationsApi,
  WAITING_LIST_PAGE_SIZE,
  type ReservationFilters,
} from '../lib/reservations';
import { mawkibsApi } from '../lib/mawkibs';
import type { Mawkib, Reservation } from '../types';

const WAITING_LIST_REFRESH_MS = 15_000;

interface WaitingListFilters {
  mawkibIdStr: string;
  pilgrimNationalId: string;
  pilgrimMobile: string;
  trackingCode: string;
  createdAtDate: string;
}

const emptyFilters: WaitingListFilters = {
  mawkibIdStr: '',
  pilgrimNationalId: '',
  pilgrimMobile: '',
  trackingCode: '',
  createdAtDate: '',
};

function parseFilters(form: WaitingListFilters): ReservationFilters {
  const filters: ReservationFilters = {
    status: 'Pending',
    sortOrder: 'asc',
  };
  if (form.mawkibIdStr) filters.mawkibId = parseInt(form.mawkibIdStr, 10);
  if (form.pilgrimNationalId.trim()) {
    filters.pilgrimNationalId = form.pilgrimNationalId.trim();
  }
  if (form.pilgrimMobile.trim()) filters.pilgrimMobile = form.pilgrimMobile.trim();
  if (form.trackingCode.trim()) filters.trackingCode = form.trackingCode.trim();
  if (form.createdAtDate) {
    filters.createdAtFrom = form.createdAtDate;
    filters.createdAtTo = form.createdAtDate;
  }
  return filters;
}

function reservationFiltersKey(filters: ReservationFilters): string {
  return JSON.stringify(filters);
}

function PendingCountBoxes({
  total,
  byMawkib,
  mawkibById,
}: {
  total: number;
  byMawkib: { mawkibId: number; mawkibName: string; count: number }[];
  mawkibById: Map<number, Mawkib>;
}) {
  const allBoxes = [
    { key: 'total', label: 'کل لیست انتظار', count: total, accent: 'bg-amber-500' },
    ...byMawkib.map((item) => ({
      key: String(item.mawkibId),
      label: item.mawkibName,
      count: item.count,
      accent: 'bg-[#4a6fa5]',
    })),
  ];

  const compact = allBoxes.length > 6;

  return (
    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
      {allBoxes.map((box) => {
        const mawkib =
          box.key === 'total' ? null : mawkibById.get(Number(box.key));
        const isTotalBox = box.key === 'total';

        return (
          <div
            key={box.key}
            className={`rounded-xl border border-slate-200/80 bg-white shadow-sm ${
              compact ? 'p-2.5' : 'p-3.5'
            }`}
          >
            <div className={`mb-2 h-1 w-8 rounded-full ${box.accent}`} />
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p
                  className={`font-bold text-slate-800 ${
                    compact ? 'text-lg' : 'text-2xl'
                  }`}
                >
                  {box.count.toLocaleString('fa-IR')}
                </p>
                <p
                  className={`mt-0.5 truncate leading-snug text-slate-500 ${
                    compact ? 'text-[10px]' : 'text-xs'
                  }`}
                  title={box.label}
                >
                  {box.label}
                </p>
              </div>
              {!isTotalBox && mawkib && (
                <div className="shrink-0 border-s border-slate-100 ps-2">
                  <MawkibCapacityPills mawkib={mawkib} compact stacked />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const actionIconClass = 'h-3.5 w-3.5 shrink-0';

function stopActionBubble(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

export function WaitingListPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<ReservationFilters>({
    status: 'Pending',
    sortOrder: 'asc',
  });
  const [page, setPage] = useState(1);
  const [rejectingReservation, setRejectingReservation] =
    useState<Reservation | null>(null);
  const [actionReservationId, setActionReservationId] = useState<number | null>(
    null,
  );
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(
    null,
  );

  const { data: pendingCounts, isLoading: countsLoading, refetch: refetchCounts } =
    useQuery({
      queryKey: ['reservations-pending-counts'],
      queryFn: () => reservationsApi.getPendingCounts(),
      refetchInterval: WAITING_LIST_REFRESH_MS,
      refetchIntervalInBackground: true,
    });

  const { data: mawkibs = [], refetch: refetchMawkibs } = useQuery({
    queryKey: ['waiting-list-mawkibs', isAdmin],
    queryFn: () =>
      isAdmin
        ? mawkibsApi.getAdminListForExport()
        : mawkibsApi.getMyListForExport(),
    refetchInterval: WAITING_LIST_REFRESH_MS,
    refetchIntervalInBackground: true,
  });

  const mawkibById = useMemo(
    () => new Map(mawkibs.map((mawkib) => [mawkib.id, mawkib])),
    [mawkibs],
  );

  const {
    data: reservationsPage,
    isLoading,
    refetch: refetchWaitingList,
  } = useQuery({
    queryKey: ['waiting-list', appliedFilters, page, isAdmin],
    queryFn: () => {
      const params = {
        ...appliedFilters,
        page,
        pageSize: WAITING_LIST_PAGE_SIZE,
      };
      return isAdmin
        ? reservationsApi.getAdminListPaginated(params)
        : reservationsApi.getMyListPaginated(params);
    },
    refetchInterval: WAITING_LIST_REFRESH_MS,
    refetchIntervalInBackground: true,
  });

  const reservations = reservationsPage?.items ?? [];
  const totalReservations = reservationsPage?.total ?? 0;
  const totalPages = reservationsPage?.totalPages ?? 1;

  const invalidateLists = () => {
    void queryClient.invalidateQueries({ queryKey: ['waiting-list'] });
    void queryClient.invalidateQueries({ queryKey: ['reservations-pending-counts'] });
    void queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
    void queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    void queryClient.invalidateQueries({ queryKey: ['owner-reservations'] });
    void queryClient.invalidateQueries({ queryKey: ['mawkibs-my'] });
    void queryClient.invalidateQueries({ queryKey: ['waiting-list-mawkibs'] });
  };

  const approveReservation = useMutation({
    mutationFn: (id: number) => reservationsApi.updateStatus(id, 'Confirmed'),
    onMutate: (id) => {
      setActionReservationId(id);
      setActionType('approve');
    },
    onSuccess: () => {
      toast.success('رزرو تایید شد');
      invalidateLists();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'خطا در تایید رزرو'));
    },
    onSettled: () => {
      setActionReservationId(null);
      setActionType(null);
    },
  });

  const rejectReservation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      reservationsApi.cancel(id, note),
    onMutate: ({ id }) => {
      setActionReservationId(id);
      setActionType('reject');
    },
    onSuccess: () => {
      toast.success('درخواست رد شد');
      invalidateLists();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'خطا در رد درخواست'));
    },
    onSettled: () => {
      setActionReservationId(null);
      setActionType(null);
    },
  });

  const refreshPageData = () => {
    void refetchWaitingList();
    void refetchCounts();
    void refetchMawkibs();
  };

  const applyFilters = () => {
    const nextFilters = parseFilters(filters);
    setPage(1);
    if (reservationFiltersKey(nextFilters) === reservationFiltersKey(appliedFilters)) {
      refreshPageData();
      return;
    }
    setAppliedFilters(nextFilters);
  };

  const resetFilters = () => {
    const baseFilters: ReservationFilters = { status: 'Pending', sortOrder: 'asc' };
    setFilters(emptyFilters);
    setPage(1);
    if (
      reservationFiltersKey(appliedFilters) === reservationFiltersKey(baseFilters)
    ) {
      refreshPageData();
      return;
    }
    setAppliedFilters(baseFilters);
  };

  const renderRowActions = (reservation: Reservation) => {
    const isApproving =
      actionReservationId === reservation.id && actionType === 'approve';
    const isRejecting =
      actionReservationId === reservation.id && actionType === 'reject';
    const isBusy = isApproving || isRejecting;

    return (
      <div
        className="flex flex-nowrap items-center gap-1.5"
        onClick={stopActionBubble}
        onKeyDown={stopActionBubble}
        role="presentation"
      >
        <button
          type="button"
          disabled={isBusy}
          onClick={() => approveReservation.mutate(reservation.id)}
          className={`${btnAction} ${btnPrimary} inline-flex shrink-0 items-center gap-1 !min-h-8 !px-2 !py-1.5 !text-xs whitespace-nowrap`}
        >
          <NavIcon name="check" className={actionIconClass} strokeWidth={2.5} />
          {isApproving ? '...' : 'تایید'}
        </button>
        <button
          type="button"
          disabled={isBusy}
          onClick={() => setRejectingReservation(reservation)}
          className={`${btnDanger} inline-flex shrink-0 items-center gap-1 !min-h-8 !px-2 !py-1.5 !text-xs whitespace-nowrap`}
        >
          <NavIcon name="x" className={actionIconClass} strokeWidth={2.5} />
          {isRejecting ? '...' : 'رد'}
        </button>
        <Link
          to={`/reservations/${reservation.id}`}
          onClick={stopActionBubble}
          className={`${btnAction} inline-flex shrink-0 items-center gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200 !min-h-8 !px-2 !py-1.5 !text-xs whitespace-nowrap`}
        >
          <NavIcon name="info" className={actionIconClass} />
          جزئیات
        </Link>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title="لیست انتظار"
        subtitle="رزروهای در انتظار تایید، مرتب‌شده بر اساس تاریخ ثبت"
      />

      {!countsLoading && pendingCounts && (
        <PendingCountBoxes
          total={pendingCounts.total}
          byMawkib={pendingCounts.byMawkib}
          mawkibById={mawkibById}
        />
      )}

      <FilterPanel onApply={applyFilters} onReset={resetFilters}>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MawkibFilterSelect
            value={filters.mawkibIdStr}
            onChange={(mawkibIdStr) =>
              setFilters({ ...filters, mawkibIdStr })
            }
            scope={isAdmin ? 'admin' : 'my'}
            placeholder="همه موکب‌ها"
          />
          <input
            type="text"
            placeholder="کد ملی"
            value={filters.pilgrimNationalId}
            onChange={(event) =>
              setFilters({ ...filters, pilgrimNationalId: event.target.value })
            }
            className={filterInputClass}
            dir="ltr"
            inputMode="numeric"
          />
          <input
            type="text"
            placeholder="تلفن همراه"
            value={filters.pilgrimMobile}
            onChange={(event) =>
              setFilters({ ...filters, pilgrimMobile: event.target.value })
            }
            className={filterInputClass}
            dir="ltr"
          />
          <input
            type="text"
            placeholder="شناسه رزرو"
            value={filters.trackingCode}
            onChange={(event) =>
              setFilters({ ...filters, trackingCode: event.target.value })
            }
            className={filterInputClass}
            dir="ltr"
          />
          <PersianDateInput
            compact
            placeholder="تاریخ ثبت"
            value={filters.createdAtDate}
            onChange={(createdAtDate) =>
              setFilters({ ...filters, createdAtDate })
            }
          />
        </div>
      </FilterPanel>

      {isLoading ? (
        <p className="text-slate-500">در حال بارگذاری...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  تاریخ ثبت و ساعت
                </th>
                <th className="px-4 py-3 text-right">نام موکب</th>
                <th className="px-4 py-3 text-right">نام و نام خانوادگی زائر</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  تاریخ شروع
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  تاریخ پایان
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">
                  تعداد
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    رزروی در انتظار تایید یافت نشد.
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                      {formatPersianDateTimeFromIso(reservation.createdAt)}
                    </td>
                    <td className="px-4 py-3">{reservation.mawkib.name}</td>
                    <td className="px-4 py-3">{reservation.pilgrim.fullName}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatPersianDate(reservation.reservationDate.slice(0, 10))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatPersianDate(
                        (
                          reservation.reservationEndDate ??
                          reservation.reservationDate
                        ).slice(0, 10),
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <GuestCountBadges
                        male={reservation.maleGuestCount}
                        female={reservation.femaleGuestCount}
                      />
                    </td>
                    <td className="px-4 py-3">{renderRowActions(reservation)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <PaginationBar
        page={page}
        totalPages={totalPages}
        totalItems={totalReservations}
        pageSize={WAITING_LIST_PAGE_SIZE}
        onPageChange={setPage}
        itemLabel="رزرو"
        className="mt-5"
      />

      <CancelReservationModal
        open={!!rejectingReservation}
        onClose={() => setRejectingReservation(null)}
        onSubmit={async (note) => {
          if (!rejectingReservation) return;
          await rejectReservation.mutateAsync({
            id: rejectingReservation.id,
            note: note || undefined,
          });
        }}
        title="رد درخواست رزرو"
        description="در صورت تمایل دلیل رد درخواست را بنویسید تا برای زائر نمایش داده شود."
        noteLabel="دلیل رد (اختیاری)"
        submitLabel="رد درخواست"
      />
    </div>
  );
}
