import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DataCard } from "../components/ui/DataCard";
import { FilterPanel } from "../components/ui/FilterPanel";
import { PageHeader } from "../components/ui/PageHeader";
import { formatPersianDateFromIso, PersianDateInput } from "../components/ui/PersianDateInput";
import { MawkibFeedbackDetailModal } from "../components/mawkib-feedback/MawkibFeedbackDetailModal";
import {
  FEEDBACK_CONTENT_PREVIEW_LENGTH,
  FeedbackReplyListCell,
  FeedbackViewReplyButton,
  hasOwnerReply,
  replyStatusBadge,
} from "../components/mawkib-feedback/feedback-list-ui";
import {
  canManageMawkibFeedback,
  mawkibFeedbackApi,
  type MawkibFeedbackFilters,
} from "../lib/mawkib-feedback";
import { toast, toastApiError } from "../lib/toast";
import { truncateText } from "../lib/text";
import { btnDanger, btnPrimary, filterInputClass } from "../lib/styles";
import type { MawkibFeedback } from "../types";

const introText =
  "انتقادات و پیشنهادات شما مستقیماً به دست مدیران موکب می‌رسد و باعث می‌شود در آینده خدمات‌دهی بهتری برای شما زائرین عزیز داشته باشیم.";

const replyStatusLabels: Record<string, string> = {
  all: "همه",
  replied: "پاسخ‌داده‌شده",
  pending: "در انتظار پاسخ",
};

export function FeedbackListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<MawkibFeedbackFilters>({
    replyStatus: "all",
  });
  const [draft, setDraft] = useState<MawkibFeedbackFilters>({
    replyStatus: "all",
  });
  const [viewing, setViewing] = useState<MawkibFeedback | null>(null);
  const [deleting, setDeleting] = useState<MawkibFeedback | null>(null);

  const queryKey = useMemo(() => ["mawkib-feedback-my", filters], [filters]);

  const { data: feedbacks = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () => mawkibFeedbackApi.listMine(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mawkibFeedbackApi.remove(id),
    onSuccess: () => {
      toast.success("انتقاد یا پیشنهاد حذف شد");
      queryClient.invalidateQueries({ queryKey: ["mawkib-feedback-my"] });
      setDeleting(null);
      setViewing(null);
    },
    onError: (err) => {
      toastApiError(err, "خطا در حذف");
    },
  });

  const renderManageActions = (item: MawkibFeedback) => {
    if (!canManageMawkibFeedback(item)) return null;

    return (
      <div className="flex flex-wrap gap-2">
        <Link
          to={`/feedback/${item.id}/edit`}
          onClick={(e) => e.stopPropagation()}
          className={btnPrimary}
        >
          ویرایش
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDeleting(item);
          }}
          className={btnDanger}
        >
          حذف
        </button>
      </div>
    );
  };

  const openView = (item: MawkibFeedback) => setViewing(item);

  return (
    <div>
      <PageHeader
        title="انتقادات و پیشنهادات"
        action={
          <Link
            to="/feedback/new"
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            ثبت پیشنهاد جدید
          </Link>
        }
      />

      <div className="mb-6 rounded-2xl border border-[#d8e2f0] bg-[#f0f4fa] p-4 text-sm leading-7 text-[#3d5d8a] sm:p-5">
        {introText}
      </div>

      <FilterPanel
        onApply={() => {
          const next = { ...draft };
          if (JSON.stringify(next) === JSON.stringify(filters)) {
            void refetch();
            return;
          }
          setFilters(next);
        }}
        onReset={() => {
          const reset: MawkibFeedbackFilters = { replyStatus: "all" };
          setDraft(reset);
          if (JSON.stringify(reset) === JSON.stringify(filters)) {
            void refetch();
            return;
          }
          setFilters(reset);
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">جستجو</span>
            <input
              type="search"
              value={draft.search ?? ""}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, search: e.target.value }))
              }
              className={filterInputClass}
              placeholder="متن، نام موکب..."
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">وضعیت پاسخ</span>
            <select
              value={draft.replyStatus ?? "all"}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  replyStatus: e.target.value as MawkibFeedbackFilters["replyStatus"],
                }))
              }
              className={filterInputClass}
            >
              {Object.entries(replyStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">از تاریخ</span>
            <PersianDateInput
              value={draft.createdFrom ?? ""}
              onChange={(createdFrom) =>
                setDraft((prev) => ({ ...prev, createdFrom }))
              }
              placeholder="از تاریخ"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">تا تاریخ</span>
            <PersianDateInput
              value={draft.createdTo ?? ""}
              minDate={draft.createdFrom}
              onChange={(createdTo) =>
                setDraft((prev) => ({ ...prev, createdTo }))
              }
              placeholder="تا تاریخ"
            />
          </label>
        </div>
      </FilterPanel>

      {isLoading ? (
        <p className="text-slate-500">در حال بارگذاری...</p>
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {feedbacks.length === 0 ? (
              <p className="rounded-xl bg-white p-8 text-center text-slate-400 shadow-sm">
                هنوز انتقاد یا پیشنهادی ثبت نکرده‌اید
              </p>
            ) : (
              feedbacks.map((item) => (
                <DataCard
                  key={item.id}
                  title={item.mawkib.name}
                  subtitle={formatPersianDateFromIso(item.createdAt)}
                  badge={replyStatusBadge(item)}
                  onClick={() => openView(item)}
                  rows={[
                    { label: "متن", value: truncateText(item.content, FEEDBACK_CONTENT_PREVIEW_LENGTH) },
                  ]}
                  actions={
                    <div className="w-full space-y-3">
                      {hasOwnerReply(item) ? (
                        <FeedbackViewReplyButton
                          onClick={(e) => {
                            e.stopPropagation();
                            openView(item);
                          }}
                        />
                      ) : (
                        <span className="text-xs text-slate-400">در انتظار پاسخ</span>
                      )}
                      {renderManageActions(item)}
                    </div>
                  }
                />
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto rounded-xl bg-white shadow-sm lg:block">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-right">تاریخ</th>
                  <th className="px-4 py-3 text-right">موکب</th>
                  <th className="px-4 py-3 text-right">متن</th>
                  <th className="px-4 py-3 text-right">پاسخ</th>
                  <th className="px-4 py-3 text-right">وضعیت</th>
                  <th className="px-4 py-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      هنوز انتقاد یا پیشنهادی ثبت نکرده‌اید
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => openView(item)}
                      className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatPersianDateFromIso(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">{item.mawkib.name}</td>
                      <td className="max-w-xs px-4 py-3">
                        <span className="line-clamp-2 text-slate-800">
                          {truncateText(item.content, FEEDBACK_CONTENT_PREVIEW_LENGTH)}
                        </span>
                      </td>
                      <td
                        className="min-w-[12rem] max-w-sm px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FeedbackReplyListCell
                          feedback={item}
                          onView={() => openView(item)}
                        />
                      </td>
                      <td className="px-4 py-3">{replyStatusBadge(item)}</td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {renderManageActions(item) ?? (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <MawkibFeedbackDetailModal
        open={viewing !== null}
        feedback={viewing}
        mode="pilgrim"
        onClose={() => setViewing(null)}
        onEdit={(item) => {
          setViewing(null);
          navigate(`/feedback/${item.id}/edit`);
        }}
        onDelete={setDeleting}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="حذف انتقاد یا پیشنهاد"
        message="آیا از حذف این مورد مطمئن هستید؟ این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        variant="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
