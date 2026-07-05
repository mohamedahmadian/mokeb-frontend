import { formatPersianNumber } from '../../lib/capacity';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      {direction === 'right' ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      )}
    </svg>
  );
}

function DoubleChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      {direction === 'right' ? (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 5l7 7-7 7" />
        </>
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 19l-7-7 7-7" />
        </>
      )}
    </svg>
  );
}

function navBtnClass(disabled: boolean) {
  return [
    'inline-flex h-9 w-9 items-center justify-center rounded-xl border transition',
    disabled
      ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
      : 'border-slate-200 bg-white text-slate-600 hover:border-[#c5d4e8] hover:bg-[#f0f4fa] hover:text-[#4a6fa5]',
  ].join(' ');
}

export function PaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'زائر',
  className = '',
}: PaginationBarProps) {
  if (totalItems === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pageNumbers = (() => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const start = Math.max(1, Math.min(page - 2, totalPages - maxVisible + 1));
    return Array.from({ length: maxVisible }, (_, i) => start + i);
  })();

  return (
    <div
      className={`flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm sm:flex-row ${className}`}
    >
      <p className="text-sm text-slate-500">
        نمایش{' '}
        <span className="font-medium text-slate-700">
          {formatPersianNumber(from)}–{formatPersianNumber(to)}
        </span>{' '}
        از{' '}
        <span className="font-medium text-slate-700">
          {formatPersianNumber(totalItems)}
        </span>{' '}
        {itemLabel}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(1)}
          className={navBtnClass(!canPrev)}
          aria-label="صفحه اول"
          title="صفحه اول"
        >
          <DoubleChevronIcon direction="right" />
        </button>
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className={navBtnClass(!canPrev)}
          aria-label="صفحه قبل"
          title="صفحه قبل"
        >
          <ChevronIcon direction="right" />
        </button>

        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((pageNumber) => {
            const active = pageNumber === page;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={[
                  'inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-medium transition',
                  active
                    ? 'bg-[#4a6fa5] text-white shadow-sm'
                    : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50',
                ].join(' ')}
                aria-label={`صفحه ${pageNumber}`}
                aria-current={active ? 'page' : undefined}
              >
                {formatPersianNumber(pageNumber)}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className={navBtnClass(!canNext)}
          aria-label="صفحه بعد"
          title="صفحه بعد"
        >
          <ChevronIcon direction="left" />
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(totalPages)}
          className={navBtnClass(!canNext)}
          aria-label="صفحه آخر"
          title="صفحه آخر"
        >
          <DoubleChevronIcon direction="left" />
        </button>
      </div>
    </div>
  );
}
