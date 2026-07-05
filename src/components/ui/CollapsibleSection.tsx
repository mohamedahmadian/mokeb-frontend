import type { ReactNode } from 'react';

interface CollapsibleSectionProps {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  summaryIcon?: ReactNode;
  /** dashed: سبک پیش‌فرض | card: مثل کادر مشخصات همراهان */
  variant?: 'dashed' | 'card';
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export function CollapsibleSection({
  summary,
  children,
  defaultOpen = false,
  className = '',
  summaryIcon,
  variant = 'dashed',
}: CollapsibleSectionProps) {
  const isCard = variant === 'card';

  return (
    <details
      open={defaultOpen || undefined}
      className={`group overflow-hidden ${
        isCard
          ? 'rounded-2xl border border-slate-200/80 bg-white shadow-sm'
          : 'rounded-xl border border-dashed border-slate-200 bg-slate-50/60'
      } ${className}`}
    >
      <summary
        className={`flex cursor-pointer list-none items-center marker:content-none [&::-webkit-details-marker]:hidden ${
          isCard
            ? 'gap-3 p-4 sm:p-5'
            : 'justify-between gap-2 p-4 text-sm font-medium text-[#4a6fa5]'
        }`}
      >
        {isCard ? (
          <>
            {summaryIcon ? (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
                {summaryIcon}
              </span>
            ) : null}
            <h2 className="flex-1 text-base font-semibold text-slate-800 sm:text-lg">
              {summary}
            </h2>
            <ChevronIcon className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
          </>
        ) : (
          <>
            <span className="flex min-w-0 flex-1 items-center gap-3">
              {summaryIcon ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
                  {summaryIcon}
                </span>
              ) : null}
              <span>{summary}</span>
            </span>
            <ChevronIcon className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
          </>
        )}
      </summary>
      <div
        className={
          isCard
            ? 'border-t border-slate-100 px-4 pb-4 pt-2 sm:px-5'
            : 'space-y-4 border-t border-dashed border-slate-200 px-4 pb-4 pt-4'
        }
      >
        {children}
      </div>
    </details>
  );
}
