import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AttendanceRosterModal,
  AttendanceRosterSidebarButtons,
} from '../components/attendance/AttendanceRosterModal';
import { PageHeader } from '../components/ui/PageHeader';
import { NavIcon } from '../components/ui/NavIcons';
import { ReservationAttendancePanel } from '../components/reservations/ReservationAttendancePanel';
import { lookupOwnerReservationSingle } from '../lib/mawkib-owner-dashboard';
import { lookupAdminReservationSingle } from '../lib/admin-dashboard';
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
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [rosterKind, setRosterKind] = useState<AttendanceRosterKind | null>(null);

  const lookupFn = isAdmin ? lookupAdminReservationSingle : lookupOwnerReservationSingle;

  useEffect(() => {
    const q = searchParams.get('q')?.trim();
    if (q) {
      setQuery(q);
      setReservation(null);
      setSearched(false);
    }
  }, [searchParams]);

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error('کد ملی، موبایل یا شماره رزرو را وارد کنید');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const found = await lookupFn(trimmed);
      setReservation(found);
      if (!found) {
        toast.error('رزروی با این مشخصات یافت نشد');
      }
    } catch (err) {
      setReservation(null);
      toastApiError(err, 'خطا در جستجو');
    } finally {
      setLoading(false);
    }
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
                      setSearched(false);
                      setReservation(null);
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

            {searched && !loading && !reservation && (
              <div className="flex items-center gap-2 border-t border-slate-100 px-2.5 py-2 text-[11px] text-slate-500 sm:px-3">
                <NavIcon name="track" className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>رزروی با این مشخصات یافت نشد.</span>
              </div>
            )}
          </section>

          {reservation && (
            <ReservationAttendancePanel
              reservation={reservation}
              onReservationUpdate={setReservation}
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
