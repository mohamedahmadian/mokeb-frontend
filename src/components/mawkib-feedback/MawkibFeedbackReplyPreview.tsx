import { NavIcon } from '../ui/NavIcons';
import { formatPersianDateTimeFromIso } from '../ui/PersianDateInput';
import { truncateText } from '../../lib/text';

interface MawkibFeedbackReplyPreviewProps {
  reply?: string | null;
  repliedAt?: string | null;
  label?: string;
  compact?: boolean;
  emptyLabel?: string;
}

export function MawkibFeedbackReplyPreview({
  reply,
  repliedAt,
  label = 'پاسخ موکب',
  compact = false,
  emptyLabel = 'در انتظار پاسخ',
}: MawkibFeedbackReplyPreviewProps) {
  if (!reply?.trim()) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
          <NavIcon name="mail" className="h-3.5 w-3.5" />
        </span>
        <span className={compact ? 'text-xs' : 'text-sm'}>{emptyLabel}</span>
      </div>
    );
  }

  const text = compact ? truncateText(reply, 80) : reply;

  return (
    <div
      className={`rounded-xl border border-[#c5d4e8] bg-[#f0f4fa] ${
        compact ? 'p-2.5' : 'p-3.5'
      }`}
    >
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
            <NavIcon name="mail" className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-semibold text-[#3d5d8a]">{label}</span>
        </div>
        {repliedAt && (
          <span className="text-xs text-slate-400">
            {formatPersianDateTimeFromIso(repliedAt)}
          </span>
        )}
      </div>
      <p
        className={`whitespace-pre-wrap leading-relaxed text-slate-700 ${
          compact ? 'line-clamp-2 text-xs' : 'text-sm'
        }`}
      >
        {text}
      </p>
    </div>
  );
}
