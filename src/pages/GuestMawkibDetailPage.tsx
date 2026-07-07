import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GuestShell } from '../components/guest/GuestShell';
import { MawkibCardPrintButton } from '../components/mawkibs/MawkibCardPrintButton';
import { MawkibPublicDetail } from '../components/mawkibs/MawkibPublicDetail';
import { MawkibThumbnail } from '../components/mawkibs/MawkibThumbnail';
import { MawkibCapacityViewModal } from '../components/mawkibs/MawkibCapacityViewModal';
import { guestTheme } from '../lib/guest-theme';
import { mawkibToCardData } from '../lib/mawkib-card';
import { mawkibsApi } from '../lib/mawkibs';
import { isMawkibOnlineReservationEnabled } from '../lib/mawkib-online-reservation';

function IconMawkibs() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

const headerIconBtn =
  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50';

const headerPrintBtn =
  'inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 [&_svg]:h-3 [&_svg]:w-3';

export function GuestMawkibDetailPage() {
  const { id } = useParams<{ id: string }>();
  const mawkibId = Number(id);
  const [searchParams] = useSearchParams();
  const trackingCode = searchParams.get('trackingCode') ?? '';
  const focusMap = searchParams.get('focus') === 'map';
  const [capacityOpen, setCapacityOpen] = useState(false);

  const { data: mawkib, isLoading, isError } = useQuery({
    queryKey: ['mawkib-public', mawkibId],
    queryFn: () => mawkibsApi.getPublicOne(mawkibId),
    enabled: mawkibId > 0,
  });

  useEffect(() => {
    if (!focusMap || isLoading || !mawkib) return;
    const frameId = window.requestAnimationFrame(() => {
      document.getElementById('mawkib-map')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [focusMap, isLoading, mawkib]);

  const backHref = trackingCode
    ? `/guest/track?trackingCode=${encodeURIComponent(trackingCode)}`
    : '/guest/mawkibs';
  const backLabel = trackingCode ? 'بازگشت به پیگیری رزرو' : 'بازگشت به لیست موکب‌ها';

  return (
    <GuestShell maxWidth="md">
      <header className="mb-8 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3 text-right">
          {mawkib ? (
            <div className="relative shrink-0">
              <div
                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#c5d4e8]/70 to-[#e8eef6]/30 blur-[2px]"
                aria-hidden
              />
              <MawkibThumbnail
                imageUrl={mawkib.imageUrl}
                name={mawkib.name}
                className="relative h-14 w-14 rounded-xl shadow-lg shadow-slate-300/50 ring-2 ring-white sm:h-16 sm:w-16"
              />
            </div>
          ) : (
            <div className={guestTheme.headerIcon}>
              <IconMawkibs />
            </div>
          )}
          <div className="min-w-0">
            <h1 className={guestTheme.headerTitle}>جزئیات موکب</h1>
            <p className={guestTheme.headerSubtitle}>
              {mawkib?.name ?? 'اطلاعات کامل موکب'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-center">
          {mawkib && (
            <MawkibCardPrintButton
              data={mawkibToCardData(mawkib)}
              className={headerPrintBtn}
            />
          )}
          <Link
            to={backHref}
            aria-label={backLabel}
            title={backLabel}
            className={headerIconBtn}
          >
            <IconBack />
          </Link>
        </div>
      </header>

      {isLoading && (
        <div className={`${guestTheme.card} p-8 text-center text-sm text-slate-500`}>
          در حال بارگذاری...
        </div>
      )}

      {isError && !isLoading && (
        <div className={`${guestTheme.card} space-y-4 p-8 text-center`}>
          <p className="text-red-600">موکب یافت نشد.</p>
          <Link to={backHref} className={guestTheme.btnSecondary}>
            بازگشت
          </Link>
        </div>
      )}

      {mawkib && (
        <div className="space-y-4">
          <MawkibPublicDetail
            mawkib={mawkib}
            onViewCapacity={() => setCapacityOpen(true)}
            focusMap={focusMap}
          />
          <MawkibCapacityViewModal
            open={capacityOpen}
            onClose={() => setCapacityOpen(false)}
            mawkibId={mawkib.id}
            mawkibName={mawkib.name}
            serviceStartDate={mawkib.serviceStartDate}
            serviceEndDate={mawkib.serviceEndDate}
            guestReserveLinks={isMawkibOnlineReservationEnabled(mawkib)}
          />
        </div>
      )}
    </GuestShell>
  );
}
