import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataCard } from "../ui/DataCard";
import { FilterPanel } from "../ui/FilterPanel";
import { PageHeader } from "../ui/PageHeader";
import {
  formatPersianDateTimeFromIso,
  PersianDateInput,
} from "../ui/PersianDateInput";
import { MawkibFilterSelect } from "../mawkibs/MawkibFilterSelect";
import { PilgrimFilterSelect } from "../reservations/PilgrimFilterSelect";
import { MawkibFeedbackDetailModal } from "../mawkib-feedback/MawkibFeedbackDetailModal";
import {
  FeedbackReviewButton,
  replyStatusBadge,
} from "../mawkib-feedback/feedback-list-ui";
import type { MawkibFeedbackFilters } from "../../lib/mawkib-feedback";
import { filterInputClass } from "../../lib/styles";
import type { MawkibFeedback } from "../../types";

const replyStatusLabels: Record<string, string> = {
  all: "همه",
  replied: "پاسخ‌داده‌شده",
  pending: "در انتظار پاسخ",
};

interface FilterDraft {
  search: string;
  replyStatus: MawkibFeedbackFilters["replyStatus"];
  createdFrom: string;
  createdTo: string;
  pilgrimUserId: string;
  mawkibId: string;
}

const emptyDraft = (): FilterDraft => ({
  search: "",
  replyStatus: "all",
  createdFrom: "",
  createdTo: "",
  pilgrimUserId: "",
  mawkibId: "",
});

function draftToFilters(draft: FilterDraft): MawkibFeedbackFilters {
  const filters: MawkibFeedbackFilters = {
    replyStatus: draft.replyStatus ?? "all",
  };

  const search = draft.search.trim();
  if (search) filters.search = search;

  if (draft.createdFrom) filters.createdFrom = draft.createdFrom;
  if (draft.createdTo) filters.createdTo = draft.createdTo;

  const mawkibId = draft.mawkibId ? parseInt(draft.mawkibId, 10) : NaN;
  if (!Number.isNaN(mawkibId) && mawkibId > 0) {
    filters.mawkibId = mawkibId;
  }

  const authorUserId = draft.pilgrimUserId
    ? parseInt(draft.pilgrimUserId, 10)
    : NaN;
  if (!Number.isNaN(authorUserId) && authorUserId > 0) {
    filters.authorUserId = authorUserId;
  }

  return filters;
}

interface FeedbackInboxListProps {
  title: string;
  queryKeyPrefix: string;
  emptyMessage: string;
  fetchList: (filters: MawkibFeedbackFilters) => Promise<MawkibFeedback[]>;
  mawkibScope?: "my" | "admin";
}

export function FeedbackInboxList({
  title,
  queryKeyPrefix,
  emptyMessage,
  fetchList,
  mawkibScope = "my",
}: FeedbackInboxListProps) {
  const [filters, setFilters] = useState<MawkibFeedbackFilters>(() =>
    draftToFilters(emptyDraft()),
  );
  const [draft, setDraft] = useState<FilterDraft>(() => emptyDraft());
  const [viewing, setViewing] = useState<MawkibFeedback | null>(null);

  const queryKey = useMemo(
    () => [queryKeyPrefix, filters],
    [queryKeyPrefix, filters],
  );

  const { data: feedbacks = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchList(filters),
  });

  const openView = (item: MawkibFeedback) => setViewing(item);

  const applyFilters = () => {
    const next = draftToFilters(draft);
    if (JSON.stringify(next) === JSON.stringify(filters)) {
      void refetch();
      return;
    }
    setFilters(next);
  };

  const resetFilters = () => {
    const reset = emptyDraft();
    setDraft(reset);
    const next = draftToFilters(reset);
    if (JSON.stringify(next) === JSON.stringify(filters)) {
      void refetch();
      return;
    }
    setFilters(next);
  };

  return (
    <div>
      <PageHeader title={title} />

      <FilterPanel onApply={applyFilters} onReset={resetFilters}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">زائر</span>
            <PilgrimFilterSelect
              value={draft.pilgrimUserId}
              onChange={(pilgrimUserId) =>
                setDraft((prev) => ({ ...prev, pilgrimUserId }))
              }
              placeholder="جستجو و انتخاب زائر..."
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">موکب</span>
            <MawkibFilterSelect
              value={draft.mawkibId}
              onChange={(mawkibId) =>
                setDraft((prev) => ({ ...prev, mawkibId }))
              }
              scope={mawkibScope}
              placeholder="جستجو و انتخاب موکب..."
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">متن یا پاسخ</span>
            <input
              type="search"
              value={draft.search}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, search: e.target.value }))
              }
              className={filterInputClass}
              placeholder="جستجو در متن انتقاد یا پاسخ..."
            />
          </label>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              value={draft.createdFrom}
              onChange={(createdFrom) =>
                setDraft((prev) => ({ ...prev, createdFrom }))
              }
              placeholder="از تاریخ"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-600">تا تاریخ</span>
            <PersianDateInput
              value={draft.createdTo}
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
                {emptyMessage}
              </p>
            ) : (
              feedbacks.map((item) => (
                <DataCard
                  key={item.id}
                  title={item.author.fullName}
                  subtitle={formatPersianDateTimeFromIso(item.createdAt)}
                  badge={replyStatusBadge(item)}
                  rows={[
                    { label: "موکب", value: item.mawkib.name },
                  ]}
                  actions={
                    <FeedbackReviewButton
                      onClick={(e) => {
                        e.stopPropagation();
                        openView(item);
                      }}
                    />
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
                  <th className="px-4 py-3 text-right">زائر</th>
                  <th className="px-4 py-3 text-right">موکب</th>
                  <th className="px-4 py-3 text-right">وضعیت</th>
                  <th className="px-4 py-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  feedbacks.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        {formatPersianDateTimeFromIso(item.createdAt)}
                      </td>
                      <td className="px-4 py-3">{item.author.fullName}</td>
                      <td className="px-4 py-3">{item.mawkib.name}</td>
                      <td className="px-4 py-3">{replyStatusBadge(item)}</td>
                      <td className="px-4 py-3">
                        <FeedbackReviewButton
                          onClick={() => openView(item)}
                        />
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
        mode="owner"
        onClose={() => setViewing(null)}
        onReplied={(updated) => setViewing(updated)}
        invalidateQueryKeys={[queryKeyPrefix]}
      />
    </div>
  );
}
