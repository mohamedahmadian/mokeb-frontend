import type { ReactNode } from 'react';

interface DataCardRow {
  label: string;
  value: ReactNode;
}

interface DataCardProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  rows: DataCardRow[];
  actions?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function DataCard({
  title,
  subtitle,
  badge,
  rows,
  actions,
  className = '',
  onClick,
}: DataCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-white p-4 shadow-sm ${className}`}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-slate-800">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {badge}
      </div>

      <dl className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3 text-sm">
            <dt className="shrink-0 text-slate-500">{row.label}</dt>
            <dd className="min-w-0 max-w-[65%] text-left text-slate-800 line-clamp-2">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {actions && (
        <div
          className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          {actions}
        </div>
      )}
    </div>
  );
}
