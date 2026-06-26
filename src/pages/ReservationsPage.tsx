import {
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CancelReservationModal } from "../components/reservations/CancelReservationModal";
import { PilgrimFilterSelect } from "../components/reservations/PilgrimFilterSelect";
import { ReservationReviewModal } from "../components/reservations/ReservationReviewModal";
import { DataCard } from "../components/ui/DataCard";
import { NavIcon } from "../components/ui/NavIcons";
import { FilterPanel } from "../components/ui/FilterPanel";
import { PageHeader } from "../components/ui/PageHeader";
import {
  PersianDateInput,
  formatPersianDate,
} from "../components/ui/PersianDateInput";
import { formatGuestCount } from "../lib/capacity";
import { formatTimeFromIso } from "../lib/format-time";
import { useAuth } from "../contexts/AuthContext";
import {
  RESERVATION_STATUS_LABELS,
  getApiErrorMessage,
} from "../lib/constants";
import { toast, toastApiError } from "../lib/toast";
import {
  btnPrimary,
  btnAction,
  btnDanger,
  filterInputClass,
} from "../lib/styles";
import { mawkibsApi } from "../lib/mawkibs";
import {
  reservationsApi,
  type ReservationFilters,
  type ReservationStatus,
} from "../lib/reservations";
import {
  canEditReservationReview,
  canPilgrimReviewReservation,
} from "../lib/reservation-reviews";
import { usersApi } from "../lib/users";
import type { Mawkib, Reservation } from "../types";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Confirmed: "bg-[#e8eef6] text-[#3d5d8a]",
  Cancelled: "bg-red-100 text-red-700",
  Completed: "bg-slate-100 text-slate-700",
};

const emptyFilters: ReservationFilters & {
  mawkibIdStr: string;
  pilgrimUserIdStr: string;
} = {
  mawkibIdStr: "",
  pilgrimUserIdStr: "",
  status: undefined,
  reservationDateFrom: "",
  reservationDateTo: "",
  trackingCode: "",
  pilgrimMobile: "",
};

function parseFilters(form: typeof emptyFilters): ReservationFilters {
  const filters: ReservationFilters = {};
  if (form.mawkibIdStr) filters.mawkibId = parseInt(form.mawkibIdStr, 10);
  if (form.pilgrimUserIdStr)
    filters.pilgrimUserId = parseInt(form.pilgrimUserIdStr, 10);
  if (form.status) filters.status = form.status;
  if (form.reservationDateFrom)
    filters.reservationDateFrom = form.reservationDateFrom;
  if (form.reservationDateTo)
    filters.reservationDateTo = form.reservationDateTo;
  if (form.trackingCode) filters.trackingCode = form.trackingCode.trim();
  if (form.pilgrimMobile) filters.pilgrimMobile = form.pilgrimMobile;
  return filters;
}

function buildInitialAppliedFilters(
  mawkibId: string,
  pilgrimUserId: string,
): ReservationFilters {
  const filters: ReservationFilters = {};
  if (mawkibId) filters.mawkibId = parseInt(mawkibId, 10);
  if (pilgrimUserId) filters.pilgrimUserId = parseInt(pilgrimUserId, 10);
  return filters;
}

function ReservationDateCell({
  date,
  actualAt,
  timeLabel,
}: {
  date: string;
  actualAt?: string | null;
  timeLabel: string;
}) {
  const time = formatTimeFromIso(actualAt);

  return (
    <div>
      <div>{formatPersianDate(date.slice(0, 10))}</div>
      {time && (
        <p className="mt-0.5 text-xs text-emerald-700">
          {timeLabel}:{" "}
          <span dir="ltr" className="font-mono">
            {time}
          </span>
        </p>
      )}
    </div>
  );
}

export function ReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes("Admin") ?? false;
  const isMawkibOwner = user?.roles.includes("MawkibOwner") ?? false;
  const isPilgrim =
    (user?.roles.includes("Pilgrim") ?? false) && !isAdmin && !isMawkibOwner;
  const canUsePilgrimSearch = isAdmin || isMawkibOwner;
  const canConfirm = isAdmin || isMawkibOwner;
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [cancellingReservation, setCancellingReservation] =
    useState<Reservation | null>(null);
  const [deletingReservation, setDeletingReservation] =
    useState<Reservation | null>(null);
  const [reviewingReservation, setReviewingReservation] =
    useState<Reservation | null>(null);

  const initialMawkibId = searchParams.get("mawkibId") ?? "";
  const initialPilgrimUserId = searchParams.get("pilgrimUserId") ?? "";

  const [filters, setFilters] = useState({
    ...emptyFilters,
    mawkibIdStr: initialMawkibId,
    pilgrimUserIdStr: initialPilgrimUserId,
  });
  const [appliedFilters, setAppliedFilters] = useState<ReservationFilters>(() =>
    buildInitialAppliedFilters(initialMawkibId, initialPilgrimUserId),
  );

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      mawkibIdStr: initialMawkibId,
      pilgrimUserIdStr: initialPilgrimUserId,
    }));
    setAppliedFilters(
      buildInitialAppliedFilters(initialMawkibId, initialPilgrimUserId),
    );
  }, [initialMawkibId, initialPilgrimUserId]);

  const queryKey = isAdmin
    ? ["reservations-admin", appliedFilters]
    : ["reservations-my", appliedFilters];

  const { data: reservations = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      isAdmin
        ? reservationsApi.getAdminList(appliedFilters)
        : reservationsApi.getMyList(appliedFilters),
  });

  const { data: mawkibs = [] } = useQuery({
    queryKey: isAdmin
      ? ["mawkibs-admin"]
      : isPilgrim
        ? ["mawkibs-public"]
        : ["mawkibs-my"],
    queryFn: () => {
      if (isAdmin) return mawkibsApi.getAdminList();
      if (isPilgrim) return mawkibsApi.getPublicList();
      return mawkibsApi.getMyList();
    },
  });

  const { data: appliedPilgrim } = useQuery({
    queryKey: ["pilgrim-filter-applied", appliedFilters.pilgrimUserId],
    queryFn: () => usersApi.getOne(appliedFilters.pilgrimUserId!),
    enabled: !!appliedFilters.pilgrimUserId,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ReservationStatus }) =>
      reservationsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
      queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("وضعیت رزرو به‌روزرسانی شد");
    },
    onError: (error) => {
      toastApiError(error, "خطا در تغییر وضعیت");
    },
  });

  const cancelReservation = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      reservationsApi.cancel(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
      queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setCancellingReservation(null);
      toast.success("رزرو با موفقیت لغو شد");
    },
    onError: (error) => {
      toastApiError(error, "خطا در لغو رزرو");
    },
  });

  const deleteReservation = useMutation({
    mutationFn: (id: number) => reservationsApi.remove(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
      queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeletingReservation(null);
      toast.success(result.message);
    },
    onError: (error) => {
      toastApiError(error, "خطا در حذف رزرو");
    },
  });

  const submitReview = useMutation({
    mutationFn: ({
      id,
      content,
      isEdit,
    }: {
      id: number;
      content: string;
      isEdit: boolean;
    }) =>
      isEdit
        ? reservationsApi.updateReview(id, content)
        : reservationsApi.createReview(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations-admin"] });
      queryClient.invalidateQueries({ queryKey: ["reservations-my"] });
      setReviewingReservation(null);
      toast.success("نظر با موفقیت ذخیره شد");
    },
    onError: (error) => {
      toastApiError(error, "خطا در ثبت نظر");
    },
  });

  const applyFilters = () => setAppliedFilters(parseFilters(filters));

  const resetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters({});
  };

  const selectedMawkib = mawkibs.find(
    (m: Mawkib) => m.id === appliedFilters.mawkibId,
  );
  const selectedPilgrim = appliedPilgrim;

  const pageSubtitle = (() => {
    const parts: string[] = [];
    if (selectedMawkib) parts.push(`موکب «${selectedMawkib.name}»`);
    if (selectedPilgrim) parts.push(`زائر «${selectedPilgrim.fullName}»`);
    if (appliedFilters.trackingCode)
      parts.push(`شناسه «${appliedFilters.trackingCode}»`);
    if (parts.length === 0) return undefined;
    return `فیلتر فعال: ${parts.join(" — ")}`;
  })();

  const canCancel = (r: Reservation) => {
    if (r.status === "Cancelled" || r.status === "Completed") return false;
    if (isAdmin || isMawkibOwner) return true;
    if (isPilgrim) return r.pilgrim.id === user?.id;
    return false;
  };

  const stopRowClick = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
  };

  const actionIconClass = "h-3.5 w-3.5 shrink-0";

  const renderActions = (r: Reservation) => {
    const canReview =
      isPilgrim && canPilgrimReviewReservation(r, user?.id);
    const showRegisterReview = canReview && !r.review;
    const showEditReview =
      canReview && r.review && canEditReservationReview(r, user?.id);

    return (
      <div
        className="flex flex-wrap items-center gap-2"
        onClick={stopRowClick}
        onKeyDown={stopRowClick}
        role="presentation"
      >
        <div className="flex items-center gap-2">
          {showRegisterReview && (
            <button
              type="button"
              onClick={(e) => {
                stopRowClick(e);
                setReviewingReservation(r);
              }}
              className={`${btnAction} inline-flex items-center gap-1.5 bg-[#f0f4fa] text-[#3d5d8a] hover:bg-[#e8eef6]`}
            >
              <NavIcon name="feedback" className={actionIconClass} />
              ثبت نظر
            </button>
          )}
          {showEditReview && (
            <button
              type="button"
              onClick={(e) => {
                stopRowClick(e);
                setReviewingReservation(r);
              }}
              className={`${btnAction} inline-flex items-center gap-1.5 bg-[#f0f4fa] text-[#3d5d8a] hover:bg-[#e8eef6]`}
            >
              <NavIcon name="feedback" className={actionIconClass} />
              ویرایش نظر
            </button>
          )}
          <Link
            to={`/reservations/${r.id}`}
            className={`${btnAction} inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200`}
            onClick={stopRowClick}
          >
            <NavIcon name="info" className={actionIconClass} />
            جزئیات
          </Link>
        </div>
        {r.status === "Pending" && canConfirm && (
          <button
            type="button"
            onClick={(e) => {
              stopRowClick(e);
              updateStatus.mutate({ id: r.id, status: "Confirmed" });
            }}
            className={`${btnAction} ${btnPrimary} !min-h-9 !px-2.5 !py-1.5 !text-xs`}
          >
            تایید
          </button>
        )}
        {canCancel(r) && (
          <button
            type="button"
            onClick={(e) => {
              stopRowClick(e);
              setCancellingReservation(r);
            }}
            className={`${btnDanger} inline-flex items-center gap-1.5 !min-h-9 !px-2.5 !py-1.5 !text-xs`}
          >
            <NavIcon name="x" className={actionIconClass} strokeWidth={2} />
            لغو
          </button>
        )}
        {isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              stopRowClick(e);
              setDeletingReservation(r);
            }}
            className={`${btnAction} bg-slate-100 text-slate-700 hover:bg-slate-200`}
          >
            حذف
          </button>
        )}
      </div>
    );
  };

  if (isLoading) return <p className="text-slate-500">در حال بارگذاری...</p>;

  return (
    <div>
      <PageHeader
        title="تاریخچه رزروها"
        subtitle={pageSubtitle}
        action={
          <Link
            to={
              appliedFilters.mawkibId
                ? `/reservations/new?mawkibId=${appliedFilters.mawkibId}`
                : "/reservations/new"
            }
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            + رزرو جدید
          </Link>
        }
      />

      <FilterPanel onApply={applyFilters} onReset={resetFilters}>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={filters.mawkibIdStr}
            onChange={(e) =>
              setFilters({ ...filters, mawkibIdStr: e.target.value })
            }
            className={filterInputClass}
          >
            <option value="">همه موکب‌ها</option>
            {mawkibs.map((m: Mawkib) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={filters.status ?? ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: (e.target.value || undefined) as
                  | ReservationStatus
                  | undefined,
              })
            }
            className={filterInputClass}
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(RESERVATION_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <PersianDateInput
            compact
            placeholder="از تاریخ"
            value={filters.reservationDateFrom ?? ""}
            onChange={(reservationDateFrom) =>
              setFilters({ ...filters, reservationDateFrom })
            }
          />
          <PersianDateInput
            compact
            placeholder="تا تاریخ"
            value={filters.reservationDateTo ?? ""}
            onChange={(reservationDateTo) =>
              setFilters({ ...filters, reservationDateTo })
            }
          />
          <input
            type="text"
            placeholder="شناسه رزرو"
            value={filters.trackingCode}
            onChange={(e) =>
              setFilters({ ...filters, trackingCode: e.target.value })
            }
            className={filterInputClass}
            dir="ltr"
          />
          {canUsePilgrimSearch && (
            <>
              <input
                type="text"
                placeholder="موبایل زائر"
                value={filters.pilgrimMobile}
                onChange={(e) =>
                  setFilters({ ...filters, pilgrimMobile: e.target.value })
                }
                className={filterInputClass}
                dir="ltr"
              />
              <PilgrimFilterSelect
                value={filters.pilgrimUserIdStr}
                onChange={(pilgrimUserIdStr) =>
                  setFilters({ ...filters, pilgrimUserIdStr })
                }
              />
            </>
          )}
        </div>
      </FilterPanel>

      <div className="space-y-3 lg:hidden">
        {reservations.length === 0 ? (
          <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
            رزروی یافت نشد
          </p>
        ) : (
          reservations.map((r) => (
            <DataCard
              key={r.id}
              title={r.pilgrim.fullName}
              subtitle={r.mawkib.name}
              className="cursor-pointer transition hover:border-slate-200 hover:bg-slate-50/50"
              onClick={() => navigate(`/reservations/${r.id}`)}
              badge={
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusColors[r.status]}`}
                >
                  {RESERVATION_STATUS_LABELS[r.status]}
                </span>
              }
              rows={[
                {
                  label: "تعداد",
                  value: formatGuestCount(r.maleGuestCount, r.femaleGuestCount),
                },
                {
                  label: "تاریخ شروع",
                  value: (
                    <ReservationDateCell
                      date={r.reservationDate}
                      actualAt={r.actualCheckInAt}
                      timeLabel="ورود"
                    />
                  ),
                },
                {
                  label: "تاریخ پایان",
                  value: (
                    <ReservationDateCell
                      date={r.reservationEndDate ?? r.reservationDate}
                      actualAt={r.actualCheckOutAt}
                      timeLabel="خروج"
                    />
                  ),
                },
              ]}
              actions={renderActions(r)}
            />
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm lg:block">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-right">موکب</th>
              <th className="px-4 py-3 text-right">زائر</th>
              <th className="px-4 py-3 text-right">تعداد</th>
              <th className="px-4 py-3 text-right">تاریخ شروع</th>
              <th className="px-4 py-3 text-right">تاریخ پایان</th>
              <th className="px-4 py-3 text-right">وضعیت</th>
              <th className="px-4 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  رزروی یافت نشد
                </td>
              </tr>
            ) : (
              reservations.map((r) => (
                <tr
                  key={r.id}
                  className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                  onClick={() => navigate(`/reservations/${r.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/reservations/${r.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="link"
                  aria-label={`مشاهده جزئیات رزرو ${r.pilgrim.fullName}`}
                >
                  <td className="px-4 py-3">{r.mawkib.name}</td>
                  <td className="px-4 py-3">{r.pilgrim.fullName}</td>
                  <td className="px-4 py-3">
                    {formatGuestCount(r.maleGuestCount, r.femaleGuestCount)}
                  </td>
                  <td className="px-4 py-3">
                    <ReservationDateCell
                      date={r.reservationDate}
                      actualAt={r.actualCheckInAt}
                      timeLabel="ورود"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ReservationDateCell
                      date={r.reservationEndDate ?? r.reservationDate}
                      actualAt={r.actualCheckOutAt}
                      timeLabel="خروج"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${statusColors[r.status]}`}
                    >
                      {RESERVATION_STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {renderActions(r)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CancelReservationModal
        open={!!cancellingReservation}
        onClose={() => setCancellingReservation(null)}
        onSubmit={async (note) => {
          if (!cancellingReservation) return;
          try {
            await cancelReservation.mutateAsync({
              id: cancellingReservation.id,
              note: note || undefined,
            });
          } catch (error) {
            throw new Error(getApiErrorMessage(error, "خطا در لغو رزرو"));
          }
        }}
        description={
          isPilgrim
            ? "در صورت تمایل دلیل لغو رزرو خود را بنویسید."
            : "توضیحات لغو برای زائر نمایش داده می‌شود."
        }
      />

      <ConfirmDialog
        open={!!deletingReservation}
        onClose={() => setDeletingReservation(null)}
        onConfirm={() => {
          if (deletingReservation) {
            deleteReservation.mutate(deletingReservation.id);
          }
        }}
        title="حذف رزرو"
        message={`آیا از حذف دائمی رزرو «${deletingReservation?.pilgrim.fullName}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        confirmLabel="حذف"
        variant="danger"
        loading={deleteReservation.isPending}
      />

      {reviewingReservation && (
        <ReservationReviewModal
          open={!!reviewingReservation}
          onClose={() => setReviewingReservation(null)}
          reservation={reviewingReservation}
          initialContent={reviewingReservation.review?.content ?? ""}
          isEdit={!!reviewingReservation.review}
          onSubmit={async (content) => {
            await submitReview.mutateAsync({
              id: reviewingReservation.id,
              content,
              isEdit: !!reviewingReservation.review,
            });
          }}
        />
      )}
    </div>
  );
}
