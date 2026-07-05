import { useState } from 'react';
import { copyTextToClipboard } from '../../lib/copy-to-clipboard';
import { QRCodeSVG } from 'qrcode.react';
import { guestDetailTheme } from '../../lib/guest-theme';
import { buildHonoraryVolunteerTrackUrl } from '../../lib/honorary-volunteer-track';

interface HonoraryVolunteerTrackingHeaderProps {
  trackingCode: string;
  compact?: boolean;
}

export function HonoraryVolunteerTrackingHeader({
  trackingCode,
  compact = false,
}: HonoraryVolunteerTrackingHeaderProps) {
  const trackUrl = buildHonoraryVolunteerTrackUrl(trackingCode);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    const ok = await copyTextToClipboard(trackingCode);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`${guestDetailTheme.trackingCard} relative overflow-hidden ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      <div className="relative space-y-5">
        <div className="text-center">
          <div className={guestDetailTheme.trackingIcon}>
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
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
          </div>

          <p className="text-sm font-medium text-slate-500">کد رهگیری</p>
          <button
            type="button"
            onClick={handleCopyCode}
            className="mt-1 font-mono text-xl font-bold tracking-[0.15em] text-[#4a6fa5] transition hover:opacity-80 sm:text-2xl"
            dir="ltr"
            title="کپی کد رهگیری"
          >
            {trackingCode}
          </button>
          {copied && (
            <p className="mt-1.5 text-xs font-medium text-emerald-600">کد کپی شد</p>
          )}
        </div>

        <div className="border-t border-[#c5d4e8]/60 pt-5 text-center">
          <p className="text-sm font-medium text-slate-500">بارکد پیگیری</p>
          <div className="mx-auto mt-3 inline-flex rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100">
            <QRCodeSVG value={trackUrl} size={compact ? 128 : 160} level="M" />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            کد رهگیری را برای پیگیری وضعیت درخواست نگه دارید
          </p>
        </div>
      </div>
    </div>
  );
}
