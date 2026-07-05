import type { ReactNode } from 'react';
import { NavIcon } from '../ui/NavIcons';

interface ReportPageHeaderProps {
  title: string;
  subtitle?: string;
  scope?: 'all' | 'mine';
  icon?: ReactNode;
}

export function ReportPageHeader({
  title,
  subtitle,
  scope,
  icon,
}: ReportPageHeaderProps) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-[#c5d4e8]/50 bg-gradient-to-l from-[#4a6fa5] via-[#5b7fb8] to-[#6b8fc4] p-5 text-white shadow-lg sm:p-6">
      <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            {icon ?? <NavIcon name="reports" className="h-6 w-6 text-white" />}
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-white/80">{subtitle}</p>
            )}
          </div>
        </div>

        {scope && (
          <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            {scope === 'mine' ? 'محدوده: موکب‌های من' : 'محدوده: کل سامانه'}
          </span>
        )}
      </div>
    </div>
  );
}

export function ReportLoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200/60" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/60" />
        <div className="h-72 animate-pulse rounded-2xl bg-slate-200/60" />
      </div>
    </div>
  );
}

export function ReportErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-8 text-center">
      <p className="text-sm font-medium text-rose-700">{message}</p>
    </div>
  );
}
