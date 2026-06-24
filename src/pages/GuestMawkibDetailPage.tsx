import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GuestPageHeader, GuestShell } from '../components/guest/GuestShell';
import { MawkibPublicDetail } from '../components/mawkibs/MawkibPublicDetail';
import { guestTheme } from '../lib/guest-theme';
import { mawkibsApi } from '../lib/mawkibs';

function IconMawkibs() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

export function GuestMawkibDetailPage() {
  const { id } = useParams<{ id: string }>();
  const mawkibId = Number(id);
  const [searchParams] = useSearchParams();
  const trackingCode = searchParams.get('trackingCode') ?? '';

  const { data: mawkib, isLoading, isError } = useQuery({
    queryKey: ['mawkib-public', mawkibId],
    queryFn: () => mawkibsApi.getPublicOne(mawkibId),
    enabled: mawkibId > 0,
  });

  const backHref = trackingCode
    ? `/guest/track?trackingCode=${encodeURIComponent(trackingCode)}`
    : '/guest/mawkibs';
  const backLabel = trackingCode ? 'بازگشت به پیگیری رزرو' : 'بازگشت به لیست موکب‌ها';

  return (
    <GuestShell maxWidth="md">
      <GuestPageHeader
        icon={<IconMawkibs />}
        title="جزئیات موکب"
        subtitle="اطلاعات کامل موکب"
      />

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
          <MawkibPublicDetail mawkib={mawkib} />
          <Link to={backHref} className={`${guestTheme.btnSecondary} w-full`}>
            {backLabel}
          </Link>
        </div>
      )}
    </GuestShell>
  );
}
