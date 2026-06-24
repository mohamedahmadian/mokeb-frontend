import type { ReactNode } from 'react';

interface DatePickerClearWrapProps {
  hasValue: boolean;
  onClear: () => void;
  children: ReactNode;
}

export function DatePickerClearWrap({
  hasValue,
  onClear,
  children,
}: DatePickerClearWrapProps) {
  return (
    <div className="relative w-full">
      {children}
      {hasValue && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
          }}
          className="absolute left-2 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="حذف تاریخ"
          title="حذف تاریخ"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function withClearPadding(className: string, hasValue: boolean) {
  return hasValue ? `${className} pl-8` : className;
}
