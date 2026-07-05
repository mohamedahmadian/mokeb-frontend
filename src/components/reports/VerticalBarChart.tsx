import type { ReportCountItem } from '../../lib/reports';
import { formatPersianNumber } from '../../lib/capacity';

const BAR_COLORS = [
  '#4a6fa5',
  '#5b8fc4',
  '#14b8a6',
  '#7c3aed',
  '#f59e0b',
  '#ef4444',
];

const CHART_HEIGHT_PX = 200;
const MIN_NONZERO_BAR_PX = 18;

interface VerticalBarChartProps {
  items: ReportCountItem[];
  emptyMessage?: string;
  showValues?: boolean;
}

export function VerticalBarChart({
  items,
  emptyMessage = 'داده‌ای برای نمایش وجود ندارد',
  showValues = true,
}: VerticalBarChartProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-400">
        {emptyMessage}
      </p>
    );
  }

  const max = Math.max(...items.map((i) => i.count), 1);
  const usableHeight = CHART_HEIGHT_PX - 8;

  return (
    <div className="pt-1">
      <div
        className="flex items-end justify-between gap-1.5 sm:gap-2.5"
        style={{ height: CHART_HEIGHT_PX }}
      >
        {items.map((item, index) => {
          const color = BAR_COLORS[index % BAR_COLORS.length];
          const barHeightPx =
            item.count === 0
              ? 4
              : Math.max(
                  MIN_NONZERO_BAR_PX,
                  Math.round((item.count / max) * usableHeight),
                );

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
            >
              {showValues && (
                <span
                  className={`mb-2 text-xs font-extrabold tabular-nums sm:text-sm ${
                    item.count > 0 ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {formatPersianNumber(item.count)}
                </span>
              )}

              <div
                className={`w-full max-w-11 rounded-t-lg transition-all duration-500 ease-out ${
                  item.count > 0 ? 'shadow-sm' : 'opacity-40'
                }`}
                style={{
                  height: barHeightPx,
                  background:
                    item.count > 0
                      ? `linear-gradient(180deg, ${color}, ${color}bb)`
                      : '#cbd5e1',
                }}
                title={`${item.label}: ${formatPersianNumber(item.count)}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between gap-1 border-t border-slate-100 pt-3 sm:gap-1.5">
        {items.map((item, index) => (
          <span
            key={`label-${item.label}-${index}`}
            className="min-w-0 flex-1 px-0.5 text-center text-[8px] font-medium leading-[1.4] text-slate-500 whitespace-pre-line [overflow-wrap:anywhere] sm:text-[9px]"
            title={item.label}
          >
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
