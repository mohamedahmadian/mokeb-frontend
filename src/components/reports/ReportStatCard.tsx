import type { ReactNode } from 'react';
import { formatPersianNumber } from '../../lib/capacity';

interface ReportStatCardProps {
  label: string;
  value: number;
  icon?: ReactNode;
  tone?: 'blue' | 'teal' | 'violet' | 'amber' | 'rose' | 'slate';
  subtitle?: string;
}

const toneStyles = {
  blue: {
    card: 'from-[#eef3fa] to-white border-[#c5d4e8]/60',
    icon: 'bg-[#4a6fa5]/10 text-[#4a6fa5]',
    value: 'text-[#3d5d8a]',
  },
  teal: {
    card: 'from-teal-50 to-white border-teal-100',
    icon: 'bg-teal-100 text-teal-700',
    value: 'text-teal-800',
  },
  violet: {
    card: 'from-violet-50 to-white border-violet-100',
    icon: 'bg-violet-100 text-violet-700',
    value: 'text-violet-800',
  },
  amber: {
    card: 'from-amber-50 to-white border-amber-100',
    icon: 'bg-amber-100 text-amber-700',
    value: 'text-amber-800',
  },
  rose: {
    card: 'from-rose-50 to-white border-rose-100',
    icon: 'bg-rose-100 text-rose-700',
    value: 'text-rose-800',
  },
  slate: {
    card: 'from-slate-50 to-white border-slate-200',
    icon: 'bg-slate-100 text-slate-600',
    value: 'text-slate-800',
  },
};

export function ReportStatCard({
  label,
  value,
  icon,
  tone = 'blue',
  subtitle,
}: ReportStatCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition hover:shadow-md ${styles.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className={`mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl ${styles.value}`}>
            {formatPersianNumber(value)}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface ReportChartCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ReportChartCard({
  title,
  subtitle,
  icon,
  children,
  className = '',
}: ReportChartCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-l from-slate-50/80 to-white px-4 py-4 sm:px-5">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
