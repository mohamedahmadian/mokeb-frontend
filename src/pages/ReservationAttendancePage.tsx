import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AttendanceRosterModal,
  AttendanceRosterSidebarButtons,
} from '../components/attendance/AttendanceRosterModal';
import {
  mergeLookupMatches,
  ReservationLookupMatchesBar,
} from '../components/reservations/ReservationLookupMatchesBar';
import { PageHeader } from '../components/ui/PageHeader';
import { NavIcon } from '../components/ui/NavIcons';
import { ReservationAttendancePanel } from '../components/reservations/ReservationAttendancePanel';
import { lookupOwnerReservation } from '../lib/mawkib-owner-dashboard';
import { lookupAdminReservation } from '../lib/admin-dashboard';
import { filterConfirmedLookupMatches } from '../lib/reservation-lookup';
import type { AttendanceRosterKind } from '../lib/attendance-roster';
import { useAuth } from '../contexts/AuthContext';
import { btnAction, inputClass } from '../lib/styles';
import { toast, toastApiError } from '../lib/toast';
import type { Reservation } from '../types';

const dashboardActionBtn = `${btnAction} inline-flex shrink-0 items-center justify-center gap-1.5 border !min-h-8 !px-2.5 !py-1.5 !text-[11px]`;
const dashboardSecondaryBtn = `${dashboardActionBtn} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;

export function ReservationAttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q')?.trim() ?? '');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Reservation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rosterKind, setRosterKind] = useState<AttendanceRosterKind | null>(null);

  const reservation = useMemo(
    () => matches.find((item) => item.id === selectedId) ?? matches[0] ?? null,
    [matches, selectedId],
  );

  const runSearch = useCallback(
    async (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        toast.error('کد ملی، موبایل یا شماره رزرو را وارد کنید');
        return;
      }

      const lookup = isAdmin ? lookupAdminReservation : lookupOwnerReservation;

      setLoading(true);
      setSearched(true);
      try {
        const result = await lookup(trimmed, { status: 'Confirmed' });
        const merged = filterConfirmedLookupMatches(
          mergeLookupMatches(result.reservation, result.alternatives),
        );
        setMatches(merged);
        setSelectedId(merged[0]?.id ?? null);

        if (merged.length === 0) {
          toast.error('رزرو تایید شده‌ای با این مشخصات یافت نشد');
        }
      } catch (err) {
        setMatches([]);
        setSelectedId(null);
        toastApiError(err, 'خطا در جستجو');
      } finally {
        setLoading(false);
      }
    },
    [isAdmin],
  );

  useEffect(() => {
    const q = searchParams.get('q')?.trim();
    if (!q) return;
    setQuery(q);
    void runSearch(q);
  }, [searchParams, runSearch]);

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    await runSearch(query);
  };

  const handleReservationUpdate = (updated: Reservation) => {
    setMatches((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const resetSearchState = () => {
    setSearched(false);
    setMatches([]);
    setSelectedId(null);
  };

  const handleSelectMatch = async (item: Reservation) => {
    setSelectedId(item.id);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 font-sans">
      <PageHeader
        title="ورود و خروج"
        subtitle="جستجوی زائر و ثبت رویدادهای ورود، خروج موقت و خروج نهایی"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <AttendanceRosterSidebarButtons
          className="lg:order-2"
          onOpenAbsent={() => setRosterKind('absent')}
          onOpenPresent={() => setRosterKind('present')}
        />

        <div className="min-w-0 flex-1 space-y-4 lg:order-1">
          <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
            <form onSubmit={handleSearch} className="space-y-2 p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
                  <NavIcon name="track" className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <h2 className="text-sm font-semibold text-slate-800">جستجوی زائر</h2>
              </div>

              <div className="flex flex-col gap-1.5 sm:flex-row">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (searched) {
                      resetSearchState();
                    }
                  }}
                  placeholder="موبایل، کد ملی یا شماره رزرو"
                  className={`${inputClass} min-w-0 flex-1 !min-h-9 !py-2 text-right !text-sm`}
                  dir="ltr"
                  inputMode="text"
                  autoComplete="off"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`${dashboardSecondaryBtn} !min-h-9 !px-3 sm:min-w-[5.5rem]`}
                >
                  <NavIcon name="track" className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {loading ? '...' : 'جستجو'}
                </button>
              </div>
            </form>

            {searched && !loading && matches.length === 0 && (
              <div className="flex items-center gap-2 border-t border-slate-100 px-2.5 py-2 text-[11px] text-slate-500 sm:px-3">
                <NavIcon name="track" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>رزرو تایید شده‌ای با این مشخصات یافت نشد.</span>
              </div>
            )}
          </section>

          {matches.length > 1 && selectedId != null && (
            <ReservationLookupMatchesBar
              matches={matches}
              selectedId={selectedId}
              onSelect={handleSelectMatch}
            />
          )}

          {reservation && (
            <ReservationAttendancePanel
              reservation={reservation}
              onReservationUpdate={handleReservationUpdate}
            />
          )}
        </div>
      </div>

      {rosterKind && (
        <AttendanceRosterModal
          open={rosterKind !== null}
          kind={rosterKind}
          onClose={() => setRosterKind(null)}
        />
      )}
    </div>
  );
}
