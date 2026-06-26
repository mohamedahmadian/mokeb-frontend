import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataCard } from "../ui/DataCard";
import { FilterPanel } from "../ui/FilterPanel";
import { PageHeader } from "../ui/PageHeader";
import { formatPersianDateFromIso, PersianDateInput } from "../ui/PersianDateInput";
import { MawkibFeedbackDetailModal } from "../mawkib-feedback/MawkibFeedbackDetailModal";
import {
  FEEDBACK_CONTENT_PREVIEW_LENGTH,
  FeedbackReplyListCell,
  FeedbackViewReplyButton,
  hasOwnerReply,
  replyStatusBadge,
} from "../mawkib-feedback/feedback-list-ui";
import type { MawkibFeedbackFilters } from "../../lib/mawkib-feedback";
import { filterInputClass } from "../../lib/styles";
import { truncateText } from "../../lib/text";
import type { MawkibFeedback } from "../../types";

const replyStatusLabels: Record<string, string> = {
  all: "همه",
  replied: "پاسخ‌داده‌شده",
  pending: "در انتظار پاسخ",
};

interface FeedbackInboxListProps {
  title: string;
  queryKeyPrefix: string;
  emptyMessage: string;
  fetchList: (filters: MawkibFeedbackFilters) => Promise<MawkibFeedback[]>;
}

export function FeedbackInboxList({
  title,
  queryKeyPrefix,
  emptyMessage,
  fetchList,
}: FeedbackInboxListProps) {
  const [filters, setFilters] = useState<MawkibFeedbackFilters>({
    replyStatus: "all",
  });
  const [draft, setDraft] = useState<MawkibFeedbackFilters>({
    replyStatus: "all",
  });
  const [viewing, setViewing] = useState<MawkibFeedback | null>(null);

  const queryKey = useMemo(
    () => [queryKeyPrefix, filters],
    [queryKeyPrefix, filters],
  );

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchList(filters),
  });

  const openView = (item: MawkibFeedback) => setViewing(item);

  return (
    <div>
      <PageHeader title={title} />

      <FilterPanel
        onApply={() => setFilters({ ...draft })}
        onReset={() => {
          const reset: MawkibFeedbackFilters = { replyStatus: "all" };
          setDraft(reset);
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
              placeholder="متن، نام زائر، موکب..."
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
                {emptyMessage}
              </p>
            ) : (
              feedbacks.map((item) => (
                <DataCard
                  key={item.id}
                  title={item.author.fullName}
                  subtitle={formatPersianDateFromIso(item.createdAt)}
                  badge={replyStatusBadge(item)}
                  onClick={() => openView(item)}
                  rows={[
                    { label: "موکب", value: truncateText(item.mawkib.name, 40) },
                    { label: "متن", value: truncateText(item.content, FEEDBACK_CONTENT_PREVIEW_LENGTH) },
                  ]}
                  actions={
                    hasOwnerReply(item) ? (
                      <FeedbackViewReplyButton
                        onClick={(e) => {
                          e.stopPropagation();
                          openView(item);
                        }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">در انتظار پاسخ</span>
                    )
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
                  <th className="px-4 py-3 text-right">متن</th>
                  <th className="px-4 py-3 text-right">پاسخ</th>
                  <th className="px-4 py-3 text-right">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      {emptyMessage}
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
                      <td className="px-4 py-3">{item.author.fullName}</td>
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
