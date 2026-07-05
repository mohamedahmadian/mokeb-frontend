import { formatPersianNumber } from '../../lib/capacity';

export interface ChartSegment {
  label: string;
  value: number;
  color: string;
  /** When set, legend shows value/capacity instead of share-of-total percent. */
  capacity?: number;
}

interface DonutChartProps {
  segments: ChartSegment[];
  centerLabel?: string;
  centerValue?: number;
  size?: number;
  className?: string;
  /** side: legend beside chart (default). below: compact legend under chart. */
  legendPlacement?: 'side' | 'below';
}

function LegendRow({
  segment,
  pct,
  compact,
  align,
}: {
  segment: ChartSegment;
  pct: number;
  compact?: boolean;
  align?: 'start' | 'end' | 'center';
}) {
  const alignClass =
    align === 'end'
      ? 'items-end text-left'
      : align === 'start'
        ? 'items-start text-right'
        : 'items-center text-center';
  const hasCapacity = segment.capacity != null && segment.capacity > 0;

  return (
    <div className={`flex min-w-0 flex-col gap-0.5 ${alignClass}`}>
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: segment.color }}
        />
        <span
          className={`font-medium text-slate-600 ${compact ? 'text-[11px]' : 'text-sm'}`}
        >
          {segment.label}
        </span>
      </div>
      <div className={compact ? 'text-[11px]' : 'text-sm'}>
        {hasCapacity ? (
          <>
            <span className="font-bold text-slate-800">
              {formatPersianNumber(segment.value)}
            </span>
            <span className="text-slate-500">
              {' '}
              از {formatPersianNumber(segment.capacity!)}
            </span>
            <span className="mr-1 text-slate-400">
              ({formatPersianNumber(pct)}٪)
            </span>
          </>
        ) : (
          <>
            <span className="font-bold text-slate-800">
              {formatPersianNumber(segment.value)}
            </span>
            <span className="mr-1 text-slate-400">
              ({formatPersianNumber(pct)}٪)
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function DonutChart({
  segments,
  centerLabel = 'کل',
  centerValue,
  size = 220,
  className = '',
  legendPlacement = 'side',
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const displayTotal = centerValue ?? total;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let offset = 0;

  const drawableSegments = segments.filter((segment) => segment.value > 0);
  const arcTotal = drawableSegments.reduce((sum, s) => sum + s.value, 0);

  const arcs =
    arcTotal > 0
      ? drawableSegments.map((segment) => {
          const fraction = segment.value / arcTotal;
          const dash = circumference * fraction;
          const currentOffset = offset;
          offset += dash;
          const isFullCircle =
            drawableSegments.length === 1 && fraction >= 0.999;
          return {
            ...segment,
            dash,
            offset: currentOffset,
            fraction,
            linecap: isFullCircle ? ('butt' as const) : ('round' as const),
          };
        })
      : [];

  const legendItems = segments.map((segment) => {
    const pct =
      segment.capacity != null && segment.capacity > 0
        ? Math.round((segment.value / segment.capacity) * 100)
        : total > 0
          ? Math.round((segment.value / total) * 100)
          : 0;
    return { segment, pct };
  });

  const chartNode = (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#e8eef6"
          strokeWidth={stroke}
        />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap={arc.linecap}
            className="transition-all duration-700 ease-out"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`font-extrabold text-slate-800 ${legendPlacement === 'below' ? 'text-2xl' : 'text-3xl'}`}
        >
          {formatPersianNumber(displayTotal)}
        </span>
        <span className="mt-0.5 text-xs font-medium text-slate-500">{centerLabel}</span>
      </div>
    </div>
  );

  if (legendPlacement === 'below') {
    const maleItem = legendItems.find((item) => item.segment.label === 'آقایان');
    const femaleItem = legendItems.find((item) => item.segment.label === 'بانوان');
    const orderedItems =
      maleItem && femaleItem
        ? [maleItem, femaleItem]
        : legendItems;

    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        {chartNode}
        <div className="grid w-full grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          {orderedItems.map((item, index) => (
            <LegendRow
              key={item.segment.label}
              segment={item.segment}
              pct={item.pct}
              compact
              align={index === 0 ? 'start' : 'end'}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-5 lg:flex-row lg:items-center lg:justify-between ${className}`}>
      {chartNode}

      <div className="w-full min-w-0 flex-1 space-y-2.5">
        {legendItems.map(({ segment, pct }) => (
          <div
            key={segment.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                style={{ backgroundColor: segment.color }}
              />
              <span className="truncate text-sm font-medium text-slate-700">
                {segment.label}
              </span>
            </div>
            <div className="shrink-0 text-left">
              {segment.capacity != null && segment.capacity > 0 ? (
                <>
                  <span className="text-sm font-bold text-slate-800">
                    {formatPersianNumber(segment.value)}
                  </span>
                  <span className="text-sm text-slate-500">
                    {' '}
                    از {formatPersianNumber(segment.capacity)}
                  </span>
                  <span className="mr-1.5 text-xs text-slate-400">
                    ({formatPersianNumber(pct)}٪)
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-slate-800">
                    {formatPersianNumber(segment.value)}
                  </span>
                  <span className="mr-1.5 text-xs text-slate-400">
                    ({formatPersianNumber(pct)}٪)
                  </span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
