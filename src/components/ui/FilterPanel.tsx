import { useState, type ReactNode } from 'react';

interface FilterPanelProps {
  title?: string;
  children: ReactNode;
  onApply: () => void;
  onReset: () => void;
}

export function FilterPanel({
  title = 'فیلترها',
  children,
  onApply,
  onReset,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between md:hidden"
      >
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        <svg
          className={`h-5 w-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <h2 className="mb-3 hidden text-sm font-semibold text-slate-700 md:block">
        {title}
      </h2>

      <div className={`${open ? 'mt-3 block' : 'hidden'} md:block`}>
        {children}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onApply}
            className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm text-white hover:bg-slate-700"
          >
            اعمال فیلتر
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            پاک کردن
          </button>
        </div>
      </div>
    </div>
  );
}
