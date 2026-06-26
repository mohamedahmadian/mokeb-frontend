import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../Modal";
import { formatPersianDateTimeFromIso } from "../ui/PersianDateInput";
import { mawkibCityLabel, type MawkibCity } from "../../lib/mawkib-locations";
import { canManageMawkibFeedback, mawkibFeedbackApi } from "../../lib/mawkib-feedback";
import { toast, toastApiError } from "../../lib/toast";
import { btnDanger, btnPrimary, inputClass } from "../../lib/styles";
import type { MawkibFeedback } from "../../types";
import { MawkibFeedbackReplyPreview } from "./MawkibFeedbackReplyPreview";
import {
  detailIcons,
  FeedbackDetailField,
  FeedbackDetailSection,
  MapPinIcon,
  NavIcon,
} from "./feedback-detail-ui";

interface MawkibFeedbackDetailModalProps {
  open: boolean;
  feedback: MawkibFeedback | null;
  mode: "pilgrim" | "owner";
  onClose: () => void;
  onReplied?: (feedback: MawkibFeedback) => void;
  onEdit?: (feedback: MawkibFeedback) => void;
  onDelete?: (feedback: MawkibFeedback) => void;
  invalidateQueryKeys?: string[];
}

export function MawkibFeedbackDetailModal({
  open,
  feedback,
  mode,
  onClose,
  onReplied,
  onEdit,
  onDelete,
  invalidateQueryKeys = ["mawkib-feedback-inbox"],
}: MawkibFeedbackDetailModalProps) {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (feedback) {
      setReplyText(feedback.ownerReply ?? "");
    }
  }, [feedback]);

  const replyMutation = useMutation({
    mutationFn: () =>
      mawkibFeedbackApi.reply(feedback!.id, { ownerReply: replyText.trim() }),
    onSuccess: (updated) => {
      toast.success("پاسخ با موفقیت ثبت شد");
      for (const key of invalidateQueryKeys) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      onReplied?.(updated);
      onClose();
    },
    onError: (err) => {
      toastApiError(err, "خطا در ثبت پاسخ");
    },
  });

  if (!feedback) return null;

  const canReply =
    mode === "owner" && replyText.trim().length >= 3 && !replyMutation.isPending;
  const canManage =
    mode === "pilgrim" && feedback && canManageMawkibFeedback(feedback);
  const owner = feedback.mawkib.owner;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="جزئیات انتقاد یا پیشنهاد"
      size="lg"
    >
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 text-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FeedbackDetailField
            icon={detailIcons.calendar}
            label="تاریخ و ساعت ثبت"
            value={formatPersianDateTimeFromIso(feedback.createdAt)}
          />
          <FeedbackDetailField
            icon={<NavIcon name="mawkibs" className="h-5 w-5" />}
            label="موکب"
            value={feedback.mawkib.name}
          />
          <FeedbackDetailField
            icon={<MapPinIcon />}
            label="شهر"
            value={mawkibCityLabel(
              feedback.mawkib.mawkibCity as MawkibCity | null | undefined,
            )}
          />
          <FeedbackDetailField
            icon={detailIcons.phone}
            label="شماره تماس موکب"
            value={feedback.mawkib.phoneNumber || "—"}
            valueClassName="font-mono tracking-wide"
          />

          {mode === "pilgrim" && (
            <>
              <FeedbackDetailField
                icon={<NavIcon name="mawkibOwners" className="h-5 w-5" />}
                label="مسئول موکب"
                value={owner?.fullName ?? "—"}
              />
              <FeedbackDetailField
                icon={detailIcons.phone}
                label="شماره تماس مستقیم مسئول"
                value={owner?.mobileNumber ?? "—"}
                valueClassName="font-mono tracking-wide"
              />
            </>
          )}

          {mode === "owner" && (
            <>
              <FeedbackDetailField
                icon={<NavIcon name="pilgrims" className="h-5 w-5" />}
                label="زائر"
                value={feedback.author.fullName}
              />
              <FeedbackDetailField
                icon={detailIcons.phone}
                label="شماره تماس زائر"
                value={feedback.author.mobileNumber}
                valueClassName="font-mono tracking-wide"
              />
            </>
          )}
        </div>

        <FeedbackDetailSection icon={detailIcons.message} label="متن پیام">
          <p className="whitespace-pre-wrap leading-7 text-slate-800">
            {feedback.content}
          </p>
        </FeedbackDetailSection>

        {mode === "pilgrim" && (
          <MawkibFeedbackReplyPreview
            reply={feedback.ownerReply}
            repliedAt={feedback.repliedAt}
          />
        )}

        {mode === "owner" && feedback.ownerReply && (
          <MawkibFeedbackReplyPreview
            reply={feedback.ownerReply}
            repliedAt={feedback.repliedAt}
            label="پاسخ ثبت‌شده"
          />
        )}

        {mode === "owner" && (
          <label className="block">
            <span className="mb-2 flex items-center gap-2 font-medium text-slate-700">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
                <NavIcon name="mail" className="h-4 w-4" />
              </span>
              پاسخ به زائر
            </span>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={5}
              className={inputClass}
              placeholder="پاسخ خود را بنویسید..."
            />
          </label>
        )}

        {mode === "owner" && (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              بستن
            </button>
            <button
              type="button"
              disabled={!canReply}
              onClick={() => replyMutation.mutate()}
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              {replyMutation.isPending ? "در حال ثبت..." : "ثبت پاسخ"}
            </button>
          </div>
        )}

        {canManage && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              بستن
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(feedback)}
              className={`${btnDanger} w-full sm:w-auto`}
            >
              حذف
            </button>
            <button
              type="button"
              onClick={() => onEdit?.(feedback)}
              className={`${btnPrimary} w-full sm:w-auto`}
            >
              ویرایش
            </button>
          </div>
        )}

        {mode === "pilgrim" && !canManage && (
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              بستن
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
