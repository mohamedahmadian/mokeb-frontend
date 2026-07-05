import { formatPersianNumber } from '../../lib/capacity';
import type { ReportCountItem } from '../../lib/reports';

const BAR_COLORS = [
  '#4a6fa5',
  '#5b8fc4',
  '#6ca8d8',
  '#14b8a6',
  '#0d9488',
  '#7c3aed',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#64748b',
];

interface HorizontalBarChartProps {
  items: ReportCountItem[];
  emptyMessage?: string;
  barColor?: string;
  usePalette?: boolean;
}

export function HorizontalBarChart({
  items,
  emptyMessage = 'داده‌ای برای نمایش وجود ندارد',
  barColor = '#4a6fa5',
  usePalette = true,
}: HorizontalBarChartProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center text-sm text-slate-400">
        {emptyMessage}
      </p>
    );
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const widthPct =
          item.count === 0
            ? 0
            : Math.max(4, (item.count / max) * 100);
        const color = usePalette
          ? BAR_COLORS[index % BAR_COLORS.length]
          : barColor;

        return (
          <div key={`${item.label}-${index}`} className="group">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium text-slate-700">{item.label}</span>
              <span className="shrink-0 font-bold text-slate-800">
                {formatPersianNumber(item.count)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full shadow-sm transition-all duration-700 ease-out group-hover:opacity-90"
                style={{
                  width: `${widthPct}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
