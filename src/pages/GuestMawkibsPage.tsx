import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  CapacityFilterToggle,
  type CapacityView,
} from "../components/guest/CapacityFilterToggle";
import { GuestPageHeader, GuestShell } from "../components/guest/GuestShell";
import {
  MawkibBrowseViewToggle,
  parseMawkibBrowseView,
  type MawkibBrowseView,
} from "../components/guest/MawkibBrowseViewToggle";
import {
  MawkibGuestBrowseFooter,
  MawkibInfoCard,
} from "../components/mawkibs/MawkibInfoCard";
import { MawkibCapacityViewModal } from "../components/mawkibs/MawkibCapacityViewModal";
import { MawkibMap } from "../components/mawkibs/MawkibMap";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { guestTheme } from "../lib/guest-theme";
import { MAWKIB_CITIES } from "../lib/mawkib-locations";
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

function parseCapacityView(value: string | null): CapacityView {
  return value === "full" ? "full" : "available";
}

export function GuestMawkibsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialCity = searchParams.get("city") ?? "";
  const initialCapacity = parseCapacityView(searchParams.get("capacity"));
  const initialView = parseMawkibBrowseView(searchParams.get("view"));

  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [mawkibCity, setMawkibCity] = useState(initialCity);
  const [capacityView, setCapacityView] =
    useState<CapacityView>(initialCapacity);
  const [browseView, setBrowseView] = useState<MawkibBrowseView>(initialView);
  const [capacityMawkib, setCapacityMawkib] = useState<Mawkib | null>(null);

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
    if (browseView === "map") params.view = "map";
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, mawkibCity, capacityView, browseView, setSearchParams]);

  useEffect(() => {
    const next = parseMawkibBrowseView(searchParams.get("view"));
    setBrowseView((current) => (current === next ? current : next));
  }, [searchParams]);

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

  const guestMawkibDetailPath = (id: number) =>
    `/guest/mawkibs/${id}?from=mawkibs`;

  return (
    <GuestShell maxWidth={browseView === "map" ? "2xl" : "lg"}>
      <GuestPageHeader
        icon={<IconMawkibs />}
        title="جستجوی موکب"
        subtitle={
          browseView === "map"
            ? "امکان جستجو و مشاهده موکب ها بر روی نقشه یا به صورت  لیستی"
            : "نام، آدرس یا شهر موکب را جستجو کنید"
        }
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

      <div className="mx-auto mt-5 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
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
        <div>
          <CapacityFilterToggle
            value={capacityView}
            onChange={setCapacityView}
          />
        </div>
        <div className="justify-self-end sm:justify-self-auto">
          <MawkibBrowseViewToggle value={browseView} onChange={setBrowseView} />
        </div>
      </div>

      <div className={`mx-auto mt-8 ${browseView === "map" ? "w-full" : ""}`}>
        {browseView === "map" ? (
          <div className="space-y-3">
            <div className="relative h-[24rem] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm sm:h-[32rem]">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#c5d4e8] border-t-[#4a6fa5]" />
                </div>
              ) : isError ? (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-red-600">
                  خطا در دریافت لیست موکب‌ها. لطفاً دوباره تلاش کنید.
                </div>
              ) : (
                <>
                  <MawkibMap
                    mountKey={`guest-map-${mawkibs.length}-${mawkibCity}`}
                    mawkibs={mawkibs}
                    mawkibCity={(mawkibCity as MawkibCity) || ""}
                    detailPath={guestMawkibDetailPath}
                  />
                  {mawkibs.length === 0 && (
                    <div className="pointer-events-none absolute inset-x-0 top-4 z-[1000] flex justify-center px-4">
                      <p className="rounded-lg bg-white/95 px-4 py-2 text-center text-sm text-slate-600 shadow-sm">
                        موکبی یافت نشد — نقشه بر اساس فیلترهای فعلی نمایش داده
                        می‌شود
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            {!isLoading && !isError && (
              <p className="text-center text-xs text-slate-500">
                {mawkibs.length > 0
                  ? `${mawkibs.length.toLocaleString("fa-IR")} موکب — برای جزئیات، موس را روی آیکون نگه دارید`
                  : "فیلترها را تغییر دهید یا جستجوی دیگری انجام دهید"}
              </p>
            )}
          </div>
        ) : isLoading ? (
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
          <div className="space-y-3">
            {mawkibs.map((mawkib) => (
              <MawkibInfoCard
                key={mawkib.id}
                mawkib={mawkib}
                footer={
                  <MawkibGuestBrowseFooter
                    onViewCapacity={() => setCapacityMawkib(mawkib)}
                    onViewDetails={() =>
                      navigate(guestMawkibDetailPath(mawkib.id))
                    }
                  />
                }
              />
            ))}
          </div>
        )}
      </div>

      <MawkibCapacityViewModal
        open={!!capacityMawkib}
        onClose={() => setCapacityMawkib(null)}
        mawkibId={capacityMawkib?.id ?? 0}
        mawkibName={capacityMawkib?.name ?? ""}
        guestReserveLinks
      />
    </GuestShell>
  );
}
