import { NavIcon } from "../ui/NavIcons";
import { btnAction } from "../../lib/styles";
import type { MawkibFeedback } from "../../types";

export const FEEDBACK_CONTENT_PREVIEW_LENGTH = 20;

const actionIconClass = "h-3.5 w-3.5 shrink-0";

export function hasOwnerReply(feedback: MawkibFeedback) {
  return !!feedback.ownerReply?.trim();
}

export function replyStatusBadge(feedback: MawkibFeedback) {
  const replied = hasOwnerReply(feedback);
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
        replied ? "bg-[#e8eef6] text-[#3d5d8a]" : "bg-amber-100 text-amber-700"
      }`}
    >
      {replied ? "پاسخ داده شده" : "در انتظار پاسخ"}
    </span>
  );
}

export function FeedbackViewReplyButton({
  onClick,
  label = "مشاهده پاسخ",
}: {
  onClick: (e: React.MouseEvent) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${btnAction} inline-flex items-center gap-1.5 bg-[#f0f4fa] text-[#3d5d8a] hover:bg-[#e8eef6]`}
    >
      <NavIcon name="mail" className={actionIconClass} />
      {label}
    </button>
  );
}

export function FeedbackReplyListCell({
  feedback,
  onView,
}: {
  feedback: MawkibFeedback;
  onView: () => void;
}) {
  if (hasOwnerReply(feedback)) {
    return (
      <FeedbackViewReplyButton
        onClick={(e) => {
          e.stopPropagation();
          onView();
        }}
      />
    );
  }

  return <span className="text-xs text-slate-400">در انتظار پاسخ</span>;
}
