import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MawkibLocationFilterSelects } from '../components/mawkibs/MawkibLocationFilterSelects';
import { MawkibMap } from '../components/mawkibs/MawkibMap';
import { FilterPanel } from '../components/ui/FilterPanel';
import { PageHeader } from '../components/ui/PageHeader';
import { filterInputClass } from '../lib/styles';
import type { MawkibCity, MawkibCountry } from '../lib/mawkib-locations';
import { mawkibsApi } from '../lib/mawkibs';

export function MawkibMapSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [name, setName] = useState(searchParams.get('name') ?? '');
  const [debouncedName, setDebouncedName] = useState(searchParams.get('name') ?? '');
  const [country, setCountry] = useState<MawkibCountry | ''>(
    (searchParams.get('country') as MawkibCountry) ?? '',
  );
  const [mawkibCity, setMawkibCity] = useState<MawkibCity | ''>(
    (searchParams.get('city') as MawkibCity) ?? '',
  );

  const [draftName, setDraftName] = useState(name);
  const [draftCountry, setDraftCountry] = useState<MawkibCountry | ''>(country);
  const [draftCity, setDraftCity] = useState<MawkibCity | ''>(mawkibCity);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedName(name.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [name]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedName) params.name = debouncedName;
    if (country) params.country = country;
    if (mawkibCity) params.city = mawkibCity;
    setSearchParams(params, { replace: true });
  }, [debouncedName, country, mawkibCity, setSearchParams]);

  const { data: mawkibs = [], isLoading, isError } = useQuery({
    queryKey: ['mawkibs-map-search', debouncedName, country, mawkibCity],
    queryFn: () =>
      mawkibsApi.getPublicList({
        ...(debouncedName ? { name: debouncedName } : {}),
        ...(country ? { country } : {}),
        ...(mawkibCity ? { mawkibCity } : {}),
      }),
  });

  const applyFilters = () => {
    setName(draftName);
    setCountry(draftCountry);
    setMawkibCity(draftCity);
  };

  const resetFilters = () => {
    setDraftName('');
    setDraftCountry('');
    setDraftCity('');
    setName('');
    setCountry('');
    setMawkibCity('');
  };

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      <PageHeader
        title="جستجوی موکب ( نقشه )"
        subtitle="موکب‌ها را روی نقشه بر اساس کشور، شهر و نام جستجو کنید"
      />

      <FilterPanel
        onApply={applyFilters}
        onReset={resetFilters}
        applyLabel="جستجوی موکب"
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">نام موکب</span>
            <input
              type="search"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="نام موکب..."
              className={filterInputClass}
            />
          </label>
          <MawkibLocationFilterSelects
            country={draftCountry}
            mawkibCity={draftCity}
            onCountryChange={setDraftCountry}
            onCityChange={setDraftCity}
            compact
          />
        </div>
      </FilterPanel>

      <div className="relative min-h-[24rem] flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm sm:min-h-[28rem] sm:h-[28rem]">
        {isLoading ? (
          <div className="flex h-full min-h-[24rem] items-center justify-center sm:min-h-[28rem]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c5d4e8] border-t-[#4a6fa5]" />
          </div>
        ) : isError ? (
          <div className="flex h-full min-h-[24rem] items-center justify-center p-6 text-center text-sm text-red-600 sm:min-h-[28rem]">
            خطا در دریافت موکب‌ها. لطفاً دوباره تلاش کنید.
          </div>
        ) : (
          <>
            <MawkibMap
              mountKey={`admin-map-${mawkibs.length}-${country}-${mawkibCity}`}
              mawkibs={mawkibs}
              country={country}
              mawkibCity={mawkibCity}
            />
            {mawkibs.length === 0 && (
              <div className="pointer-events-none absolute inset-x-0 top-4 z-[1000] flex justify-center px-4">
                <p className="rounded-lg bg-white/95 px-4 py-2 text-center text-sm text-slate-600 shadow-sm">
                  موکبی یافت نشد — نقشه بر اساس فیلترهای فعلی نمایش داده می‌شود
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {!isLoading && !isError && (
        <p className="mt-2 text-center text-xs text-slate-500">
          {mawkibs.length > 0
            ? `${mawkibs.length} موکب یافت شد — برای جزئیات، موس را روی آیکون نگه دارید`
            : 'فیلترها را تغییر دهید یا جستجوی دیگری انجام دهید'}
        </p>
      )}
    </div>
  );
}
