import type { ReactNode } from 'react';

interface CollapsibleSectionProps {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({
  summary,
  children,
  defaultOpen = false,
  className = '',
}: CollapsibleSectionProps) {
  return (
    <details
      open={defaultOpen || undefined}
      className={`group rounded-xl border border-dashed border-slate-200 bg-slate-50/60 ${className}`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-medium text-[#4a6fa5] marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{summary}</span>
        <svg
          className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="space-y-4 border-t border-dashed border-slate-200 px-4 pb-4 pt-4">
        {children}
      </div>
    </details>
  );
}
