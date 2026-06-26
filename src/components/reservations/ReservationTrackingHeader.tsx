import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { guestDetailTheme } from "../../lib/guest-theme";
import { buildReservationTrackUrl } from "../../lib/reservation-track";

interface ReservationTrackingHeaderProps {
  trackingCode: string;
  compact?: boolean;
  variant?: "guest" | "default";
  copyable?: boolean;
}

export function ReservationTrackingHeader({
  trackingCode,
  compact = false,
  variant = "default",
  copyable,
}: ReservationTrackingHeaderProps) {
  const trackUrl = buildReservationTrackUrl(trackingCode);
  const isGuest = variant === "guest";
  const isCopyable = copyable ?? isGuest;
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!isCopyable) return;

    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const codeClassName = `mt-1 font-mono text-xl font-bold tracking-[0.2em] sm:text-2xl ${
    isGuest ? "text-[#4a6fa5]" : "text-slate-800"
  } ${isCopyable ? "cursor-pointer transition hover:opacity-80" : ""}`;

  return (
    <div
      className={`relative overflow-hidden text-center ${
        isGuest
          ? `${guestDetailTheme.trackingCard} ${compact ? "p-4" : "p-6"}`
          : `rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50 via-white to-white shadow-sm ${compact ? "p-4" : "p-6"}`
      }`}
    >
      {!isGuest && (
        <>
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-teal-100/50 blur-2xl" />
        </>
      )}

      <div className="relative">
        <div
          className={
            isGuest
              ? guestDetailTheme.trackingIcon
              : "mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
          }
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-slate-500">شناسه رزرو</p>
        {isCopyable ? (
          <button
            type="button"
            onClick={handleCopyCode}
            className={codeClassName}
            dir="ltr"
            title="کپی شناسه رزرو"
          >
            {trackingCode}
          </button>
        ) : (
          <p className={codeClassName} dir="ltr">
            {trackingCode}
          </p>
        )}
        {copied ? (
          <p className="mt-1.5 text-xs font-medium text-emerald-600">شناسه کپی شد</p>
        ) : isCopyable ? (
          <p className="mt-1.5 text-xs text-slate-400">برای کپی، روی شناسه کلیک کنید</p>
        ) : null}

        <div className="mx-auto mt-4 inline-flex rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100">
          <QRCodeSVG value={trackUrl} size={compact ? 140 : 180} level="M" />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          شناسه رزرو را هنگام مراجعه به موکب همراه داشته باشید
        </p>
        <a
          href={trackUrl}
          className="mt-2 inline-block max-w-full break-all px-2 text-xs leading-relaxed text-slate-400 hover:text-slate-500"
          dir="ltr"
        >
          {trackUrl}
        </a>
      </div>
    </div>
  );
}
