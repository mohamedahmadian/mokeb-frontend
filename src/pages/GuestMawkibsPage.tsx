import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CapacityFilterToggle,
  type CapacityView,
} from "../components/guest/CapacityFilterToggle";
import { GuestPageHeader, GuestShell } from "../components/guest/GuestShell";
import { MawkibThumbnail } from "../components/mawkibs/MawkibThumbnail";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { formatCapacityFraction } from "../lib/capacity";
import { guestTheme } from "../lib/guest-theme";
import { MAWKIB_CITIES, mawkibCityLabel } from "../lib/mawkib-locations";
import type { MawkibCity } from "../lib/mawkib-locations";
import { mawkibsApi } from "../lib/mawkibs";
import type { Mawkib } from "../types";

function IconSearch() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function IconMawkibs() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

const cityOptions = MAWKIB_CITIES.map((c) => ({
  value: c.value,
  label: c.label,
}));

// ─── Icons ───────────────────────────────────────────────────────────────────

function SvgIcon({
  className = "h-3.5 w-3.5",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      {children}
    </svg>
  );
}

const cardIcons = {
  mawkib: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </SvgIcon>
  ),
  male: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </SvgIcon>
  ),
  female: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </SvgIcon>
  ),
  city: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </SvgIcon>
  ),
  phone: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </SvgIcon>
  ),
  address: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-1.5m-15-3.75h9v-3.375c0-.621-.504-1.125-1.125-1.125H5.625c-.621 0-1.125.504-1.125 1.125v3.375m0 0h-.375A1.125 1.125 0 013 17.625v-5.25A1.125 1.125 0 014.125 11.25h15.75A1.125 1.125 0 0121 12.375v5.25A1.125 1.125 0 0119.875 18.75h-.375"
      />
    </SvgIcon>
  ),
  owner: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </SvgIcon>
  ),
};

// ─── Card components ─────────────────────────────────────────────────────────

function CardIconBadge({ icon }: { icon: ReactNode }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0f4fa] text-[#4a6fa5]">
      {icon}
    </span>
  );
}

function CardField({
  icon,
  children,
  dir,
  valueClassName = "text-xs font-medium text-slate-700",
  wrap = false,
}: {
  icon: ReactNode;
  children: ReactNode;
  dir?: "ltr" | "rtl";
  valueClassName?: string;
  wrap?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 gap-2 ${wrap ? "items-start" : "items-center"}`}
    >
      <CardIconBadge icon={icon} />
      <div
        className={`min-w-0 ${wrap ? "" : "truncate"} ${valueClassName}`}
        dir={dir}
      >
        {children}
      </div>
    </div>
  );
}

function CapacityBadge({
  icon,
  label,
  available,
  total,
}: {
  icon: ReactNode;
  label: string;
  available: number;
  total: number;
}) {
  const hasAvailability = available > 0;
  return (
    <span className="inline-flex items-center gap-1 text-[11px]">
      <span className="text-[#4a6fa5]">{icon}</span>
      <span className="text-slate-500">{label}</span>
      <span
        className={`font-semibold ${hasAvailability ? "text-emerald-600" : "text-amber-600"}`}
      >
        {formatCapacityFraction(available, total)}
      </span>
    </span>
  );
}

function MawkibResultCard({
  mawkib,
  onViewDetails,
}: {
  mawkib: Mawkib;
  onViewDetails: () => void;
}) {
  const availableMale = mawkib.availableMaleCapacity ?? mawkib.maleCapacity;
  const availableFemale =
    mawkib.availableFemaleCapacity ?? mawkib.femaleCapacity;
  const cityLabel = mawkib.mawkibCity
    ? mawkibCityLabel(mawkib.mawkibCity)
    : null;
  const mawkibPhone = mawkib.phoneNumber?.trim();
  const address = mawkib.address?.trim();
  const ownerName = mawkib.owner?.fullName?.trim();
  const ownerPhone = mawkib.owner?.mobileNumber?.trim();

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onViewDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewDetails();
        }
      }}
      className={`${guestTheme.resultCard} cursor-pointer overflow-hidden p-0`}
    >
      <div className="flex flex-col gap-2.5 p-3">
        <div className="flex items-start gap-3">
          <MawkibThumbnail
            imageUrl={mawkib.imageUrl}
            name={mawkib.name}
            className="h-16 w-16 shrink-0 rounded-lg sm:h-[4.5rem] sm:w-[4.5rem]"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <CardField
              icon={cardIcons.mawkib}
              valueClassName="truncate text-sm font-semibold text-slate-800"
            >
              {mawkib.name}
            </CardField>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <CapacityBadge
                icon={cardIcons.male}
                label="ظرفیت آقایان"
                available={availableMale}
                total={mawkib.maleCapacity}
              />
              <CapacityBadge
                icon={cardIcons.female}
                label="ظرفیت خانوم ها"
                available={availableFemale}
                total={mawkib.femaleCapacity}
              />
            </div>

            {cityLabel && (
              <CardField icon={cardIcons.city}>{cityLabel}</CardField>
            )}

            {mawkibPhone && (
              <CardField
                icon={cardIcons.phone}
                dir="ltr"
                valueClassName="text-xs font-mono font-medium text-slate-700"
              >
                {mawkibPhone}
              </CardField>
            )}
          </div>

          {(ownerName || ownerPhone) && (
            <div className="flex shrink-0 flex-col justify-center gap-2 border-s border-slate-100 ps-3 sm:min-w-[8.5rem]">
              {ownerName && (
                <CardField icon={cardIcons.owner}>{ownerName}</CardField>
              )}
              {ownerPhone && (
                <CardField
                  icon={cardIcons.phone}
                  dir="ltr"
                  valueClassName="text-xs font-mono font-medium text-slate-700"
                >
                  {ownerPhone}
                </CardField>
              )}
            </div>
          )}
        </div>

        {address && (
          <div className="border-t border-slate-100 pt-2.5">
            <CardField
              icon={cardIcons.address}
              wrap
              valueClassName="text-xs leading-relaxed text-slate-600"
            >
              {address}
            </CardField>
          </div>
        )}
      </div>
    </article>
  );
}

function parseCapacityView(value: string | null): CapacityView {
  return value === "full" ? "full" : "available";
}

export function GuestMawkibsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCity = searchParams.get("city") ?? "";
  const initialCapacity = parseCapacityView(searchParams.get("capacity"));

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [mawkibCity, setMawkibCity] = useState(initialCity);
  const [capacityView, setCapacityView] =
    useState<CapacityView>(initialCapacity);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params: Record<string, string> = {};
    const trimmed = debouncedQuery.trim();
    if (trimmed) params.q = trimmed;
    if (mawkibCity) params.city = mawkibCity;
    if (capacityView !== "available") params.capacity = capacityView;
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, mawkibCity, capacityView, setSearchParams]);

  const {
    data: mawkibs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "guest-mawkibs-browse",
      debouncedQuery,
      mawkibCity,
      capacityView,
    ],
    queryFn: () =>
      mawkibsApi.getPublicList({
        ...(debouncedQuery ? { q: debouncedQuery } : {}),
        ...(mawkibCity ? { mawkibCity: mawkibCity as MawkibCity } : {}),
        capacityFilter: capacityView,
      }),
  });

  return (
    <GuestShell maxWidth="lg">
      <GuestPageHeader
        icon={<IconMawkibs />}
        title="جستجوی موکب"
        subtitle="نام، آدرس یا شهر موکب را جستجو کنید"
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setDebouncedQuery(query.trim());
        }}
        className="relative mx-auto max-w-2xl"
      >
        <div className={guestTheme.searchBox}>
          <span className="pr-4 text-slate-400">
            <IconSearch />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثلاً موکب یاس، مشهد..."
            className="w-full border-0 bg-transparent py-3.5 pl-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="ml-2 rounded-full px-3 py-1 text-xs text-slate-500 hover:bg-slate-100"
            >
              پاک کردن
            </button>
          )}
        </div>
      </form>

      <div className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600">
            شهر موکب
          </label>
          <SearchableSelect
            value={mawkibCity}
            onChange={setMawkibCity}
            options={cityOptions}
            placeholder="همه شهرها"
            searchPlaceholder="جستجوی شهر..."
            className="rounded-xl border-slate-200 py-2.5"
          />
        </div>
        <div className="justify-self-end">
          <CapacityFilterToggle
            value={capacityView}
            onChange={setCapacityView}
          />
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c5d4e8] border-t-[#4a6fa5]" />
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
            خطا در دریافت لیست موکب‌ها. لطفاً دوباره تلاش کنید.
          </div>
        ) : mawkibs.length === 0 ? (
          <div className={`${guestTheme.card} p-10 text-center`}>
            <p className="font-medium text-slate-700">موکبی یافت نشد</p>
            <p className="mt-2 text-sm text-slate-500">
              {debouncedQuery || mawkibCity || capacityView === "full"
                ? "فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید."
                : "در حال حاضر موکب فعالی ثبت نشده است."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {mawkibs.map((mawkib) => (
                <MawkibResultCard
                  key={mawkib.id}
                  mawkib={mawkib}
                  onViewDetails={() =>
                    navigate(`/guest/mawkibs/${mawkib.id}?from=mawkibs`)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </GuestShell>
  );
}
