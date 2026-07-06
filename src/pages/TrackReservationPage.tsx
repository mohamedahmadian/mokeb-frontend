import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GuestPageHeader, GuestShell } from '../components/guest/GuestShell';
import { TrackModeSwitch, type TrackMode } from '../components/guest/TrackModeSwitch';
import { ReservationToolsCard } from '../components/reservations/ReservationToolsCard';
import { ReservationDetailInfo } from '../components/reservations/ReservationDetailInfo';
import { formatPersianDateRange } from '../components/ui/PersianDateRangePicker';
import { RESERVATION_STATUS_LABELS } from '../lib/constants';
import { guestApi } from '../lib/guest';
import { guestTheme } from '../lib/guest-theme';
import { getTrackingCodeFromSearchParams } from '../lib/reservation-track';
import { toast, toastApiError } from '../lib/toast';
import type { Reservation } from '../types';

const statusBadgeClass: Record<Reservation['status'], string> = {
  Pending: 'bg-amber-100 text-amber-700 ring-amber-200',
  Confirmed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  Cancelled: 'bg-red-100 text-red-700 ring-red-200',
  Completed: 'bg-slate-100 text-slate-600 ring-slate-200',
};

function IconSearch() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function ReservationListCard({
  reservation,
  selected,
  onSelect,
}: {
  reservation: Reservation;
  selected: boolean;
  onSelect: () => void;
}) {
  const endDate = reservation.reservationEndDate ?? reservation.reservationDate;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${guestTheme.resultCard} w-full cursor-pointer p-4 text-right transition ${
        selected ? 'border-[#4a6fa5] bg-[#f0f4fa]/60 ring-2 ring-[#4a6fa5]/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-800">{reservation.mawkib.name}</p>
          <p className="mt-1 font-mono text-xs text-[#4a6fa5]">{reservation.trackingCode}</p>
          <p className="mt-1.5 text-xs text-slate-500">
            {formatPersianDateRange(
              reservation.reservationDate.slice(0, 10),
              endDate.slice(0, 10),
            )}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
            statusBadgeClass[reservation.status]
          }`}
        >
          {RESERVATION_STATUS_LABELS[reservation.status]}
        </span>
      </div>
    </button>
  );
}

function ReservationDetails({
  reservation,
  detailRef,
}: {
  reservation: Reservation;
  detailRef?: RefObject<HTMLDivElement | null>;
}) {
  const mawkibHref = `/guest/mawkibs/${reservation.mawkib.id}?trackingCode=${encodeURIComponent(reservation.trackingCode)}`;

  return (
    <div ref={detailRef} className="scroll-mt-6 space-y-4">
      <ReservationDetailInfo
        reservation={reservation}
        variant="guest"
        mawkibDetailsHref={mawkibHref}
      />
      <ReservationToolsCard
        reservation={reservation}
        variant="guest"
      />
    </div>
  );
}

export function TrackReservationPage() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = getTrackingCodeFromSearchParams(searchParams);
  const [mode, setMode] = useState<TrackMode>('code');
  const [trackingCode, setTrackingCode] = useState(codeFromUrl);
  const [mobileNumber, setMobileNumber] = useState('');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [mobileResults, setMobileResults] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const codeDetailRef = useRef<HTMLDivElement>(null);
  const mobileDetailRef = useRef<HTMLDivElement>(null);
  const shouldScrollToMobileDetailRef = useRef(false);
  const shouldScrollToCodeDetailRef = useRef(false);

  const resetResults = useCallback(() => {
    setReservation(null);
    setMobileResults([]);
  }, []);

  const lookupByCode = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error('لطفاً کد رزرو را وارد کنید');
      return;
    }

    setReservation(null);
    setMobileResults([]);
    setLoading(true);
    try {
      const result = await guestApi.trackReservation(trimmed);
      setReservation(result);
      shouldScrollToCodeDetailRef.current = true;
    } catch (err) {
      toastApiError(err, 'رزروی با این کد یافت نشد');
    } finally {
      setLoading(false);
    }
  }, []);

  const lookupByMobile = useCallback(async (mobile: string) => {
    const trimmed = mobile.trim();
    if (!trimmed) {
      toast.error('لطفاً شماره موبایل را وارد کنید');
      return;
    }

    setReservation(null);
    setMobileResults([]);
    setLoading(true);
    try {
      const results = await guestApi.trackReservationsByExactMobile(trimmed);
      setMobileResults(results);
      if (results.length === 1) {
        shouldScrollToMobileDetailRef.current = true;
        setReservation(results[0]);
      }
    } catch (err) {
      toastApiError(err, 'رزروی با این شماره موبایل یافت نشد');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!codeFromUrl) return;

    setMode('code');
    setTrackingCode(codeFromUrl);
    shouldScrollToCodeDetailRef.current = true;

    let active = true;
    (async () => {
      setReservation(null);
      setMobileResults([]);
      setLoading(true);
      try {
        const result = await guestApi.trackReservation(codeFromUrl);
        if (active) {
          setReservation(result);
        }
      } catch (err) {
        if (active) {
          toastApiError(err, 'رزروی با این کد یافت نشد');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [codeFromUrl]);

  useEffect(() => {
    if (mode !== 'code' || !reservation || !shouldScrollToCodeDetailRef.current) return;
    shouldScrollToCodeDetailRef.current = false;
    requestAnimationFrame(() => {
      codeDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [mode, reservation]);

  useEffect(() => {
    if (mode !== 'mobile' || !reservation || !shouldScrollToMobileDetailRef.current) return;
    shouldScrollToMobileDetailRef.current = false;
    requestAnimationFrame(() => {
      mobileDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [mode, reservation]);

  const handleModeChange = (nextMode: TrackMode) => {
    setMode(nextMode);
    resetResults();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'code') {
      await lookupByCode(trackingCode);
    } else {
      await lookupByMobile(mobileNumber);
    }
  };

  const subtitle =
    mode === 'code'
      ? 'کد رزرو خود را وارد کنید تا جزئیات نمایش داده شود'
      : 'شماره موبایل خود را وارد کنید تا ۲ رزرو اخیر نمایش داده شود';

  return (
    <GuestShell maxWidth="md">
      <GuestPageHeader icon={<IconSearch />} title="پیگیری رزرو" subtitle={subtitle} />

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className={guestTheme.cardLg}>
          <TrackModeSwitch value={mode} onChange={handleModeChange} />

          {mode === 'code' ? (
            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">کد رزرو</span>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className={`${guestTheme.input} font-mono tracking-wide`}
                placeholder="مثلاً 50415-1"
                dir="ltr"
                autoComplete="off"
              />
            </label>
          ) : (
            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">شماره موبایل</span>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className={guestTheme.input}
                placeholder="09121234567"
                dir="ltr"
                autoComplete="tel"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                ۲ رزرو اخیر با این شماره موبایل نمایش داده می‌شود
              </p>
            </label>
          )}

          <button type="submit" disabled={loading} className={`${guestTheme.btnPrimaryLg} mt-5`}>
            {loading
              ? 'در حال جستجو...'
              : mode === 'code'
                ? 'نمایش جزئیات'
                : 'جستجوی رزروها'}
          </button>
        </form>

        {mode === 'code' && reservation && (
          <ReservationDetails
            reservation={reservation}
            detailRef={codeDetailRef}
          />
        )}

        {mode === 'mobile' && mobileResults.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              {mobileResults.length.toLocaleString('fa-IR')} رزرو اخیر — برای مشاهده جزئیات روی هر مورد کلیک کنید
            </p>
            <div className="space-y-2">
              {mobileResults.map((item) => (
                <ReservationListCard
                  key={item.id}
                  reservation={item}
                  selected={reservation?.id === item.id}
                  onSelect={() => {
                    shouldScrollToMobileDetailRef.current = true;
                    setReservation(item);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {mode === 'mobile' && reservation && (
          <ReservationDetails
            reservation={reservation}
            detailRef={mobileDetailRef}
          />
        )}
      </div>
    </GuestShell>
  );
}
