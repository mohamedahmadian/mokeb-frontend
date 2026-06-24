import { useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GuestPageHeader, GuestShell } from '../components/guest/GuestShell';
import { MawkibNeedCard } from '../components/honorary-volunteers/MawkibNeedCard';
import { PersianDateInput } from '../components/ui/PersianDateInput';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { honoraryVolunteersApi, type HonoraryVolunteerFilters } from '../lib/honorary-volunteers';
import { mawkibsApi } from '../lib/mawkibs';
import { getApiErrorMessage } from '../lib/constants';
import { guestTheme } from '../lib/guest-theme';

function SvgIcon({ children, className = 'h-5 w-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const pageIcons = {
  needs: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </SvgIcon>
  ),
  filter: (
    <SvgIcon className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
      />
    </SvgIcon>
  ),
  search: (
    <SvgIcon className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </SvgIcon>
  ),
  empty: (
    <SvgIcon className="h-10 w-10">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </SvgIcon>
  ),
  calendar: (
    <SvgIcon className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </SvgIcon>
  ),
};

export function HonoraryVolunteerNeedsPage() {
  const [mawkibId, setMawkibId] = useState('');
  const [availabilityFrom, setAvailabilityFrom] = useState('');
  const [availabilityTo, setAvailabilityTo] = useState('');
  const [applied, setApplied] = useState<HonoraryVolunteerFilters>({});

  const { data: mawkibs = [] } = useQuery({
    queryKey: ['mawkibs-public-needs-filter'],
    queryFn: () => mawkibsApi.getPublicList(),
  });

  const {
    data: needs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['honorary-volunteer-needs', applied],
    queryFn: () => honoraryVolunteersApi.listPublicNeeds(applied),
  });

  const mawkibOptions = useMemo(
    () => mawkibs.map((m) => ({ value: String(m.id), label: m.name })),
    [mawkibs],
  );

  const hasActiveFilters =
    Boolean(mawkibId || availabilityFrom || availabilityTo || Object.keys(applied).length > 0);

  const applyFilters = () => {
    setApplied({
      mawkibId: mawkibId ? Number(mawkibId) : undefined,
      availabilityFrom: availabilityFrom || undefined,
      availabilityTo: availabilityTo || undefined,
    });
  };

  const resetFilters = () => {
    setMawkibId('');
    setAvailabilityFrom('');
    setAvailabilityTo('');
    setApplied({});
  };

  return (
    <GuestShell maxWidth="xl">
      <GuestPageHeader
        icon={pageIcons.needs}
        title="نیازمندی‌های موکب‌ها"
        subtitle="درخواست‌های نیروی کمکی ثبت‌شده توسط موکب‌داران — برای همکاری، آمادگی خود را اعلام کنید"
      />

      <section className={`${guestTheme.cardLg} mb-6`}>
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0f4fa] text-[#4a6fa5]">
            {pageIcons.filter}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">فیلتر نتایج</h2>
            <p className="text-xs text-slate-500">موکب یا بازه زمانی مورد نظر را انتخاب کنید</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600">
              {pageIcons.needs}
              موکب
            </span>
            <SearchableSelect
              value={mawkibId}
              onChange={setMawkibId}
              options={mawkibOptions}
              placeholder="همه موکب‌ها"
              searchPlaceholder="جستجوی موکب..."
              emptyMessage="موکبی یافت نشد"
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                {pageIcons.calendar}
                خدمت از تاریخ
              </span>
              <PersianDateInput value={availabilityFrom} onChange={setAvailabilityFrom} />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                {pageIcons.calendar}
                خدمت تا تاریخ
              </span>
              <PersianDateInput value={availabilityTo} onChange={setAvailabilityTo} />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={applyFilters} className={guestTheme.btnPrimary}>
              {pageIcons.search}
              جستجو
            </button>
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className={guestTheme.btnSecondary}>
                پاک کردن فیلترها
              </button>
            )}
          </div>
        </div>
      </section>

      {!isLoading && !isError && needs.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-[#4a6fa5]">{needs.length}</span> نیازمندی فعال
          </p>
        </div>
      )}

      {isError ? (
        <div className={`${guestTheme.card} p-8 text-center`}>
          <p className="text-red-600">{getApiErrorMessage(error, 'خطا در بارگذاری نیازمندی‌ها')}</p>
          <button type="button" onClick={() => refetch()} className={`${guestTheme.btnSecondary} mt-4`}>
            تلاش مجدد
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            />
          ))}
        </div>
      ) : needs.length === 0 ? (
        <div className={`${guestTheme.card} flex flex-col items-center p-10 text-center`}>
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            {pageIcons.empty}
          </span>
          <p className="font-medium text-slate-700">نیازمندی فعالی یافت نشد</p>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            {hasActiveFilters
              ? 'فیلترهای انتخاب‌شده نتیجه‌ای نداشت. فیلترها را پاک کنید یا جستجوی دیگری انجام دهید.'
              : 'در حال حاضر موکبی درخواست نیروی خادم ثبت نکرده است.'}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={resetFilters} className={`${guestTheme.btnSecondary} mt-5`}>
              پاک کردن فیلترها
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {needs.map((need) => (
            <MawkibNeedCard key={need.id} need={need} />
          ))}
        </div>
      )}
    </GuestShell>
  );
}
