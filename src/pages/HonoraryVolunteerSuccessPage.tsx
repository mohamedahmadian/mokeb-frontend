import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GuestPageHeader, GuestShell } from '../components/guest/GuestShell';
import { HonoraryVolunteerApplicationDetails } from '../components/honorary-volunteers/HonoraryVolunteerApplicationDetails';
import { HonoraryVolunteerTrackingHeader } from '../components/honorary-volunteers/HonoraryVolunteerTrackingHeader';
import { MawkibSummaryCard } from '../components/honorary-volunteers/MawkibSummaryCard';
import { guestTheme } from '../lib/guest-theme';
import { honoraryVolunteersApi } from '../lib/honorary-volunteers';

function SuccessIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SuccessShell({ children }: { children: ReactNode }) {
  return <GuestShell maxWidth="lg">{children}</GuestShell>;
}

export function HonoraryVolunteerSuccessPage() {
  const [searchParams] = useSearchParams();
  const trackingCode = searchParams.get('trackingCode') ?? '';

  const { data: application, isLoading, isError } = useQuery({
    queryKey: ['honorary-volunteer-track', trackingCode],
    queryFn: () => honoraryVolunteersApi.track(trackingCode),
    enabled: Boolean(trackingCode),
  });

  if (!trackingCode) {
    return (
      <SuccessShell>
        <div className={`${guestTheme.card} p-6 text-center text-sm text-red-600`}>
          کد رهگیری یافت نشد.
        </div>
      </SuccessShell>
    );
  }

  if (isLoading) {
    return (
      <SuccessShell>
        <p className="text-center text-slate-500">در حال بارگذاری...</p>
      </SuccessShell>
    );
  }

  if (isError || !application) {
    return (
      <SuccessShell>
        <div className={`${guestTheme.card} p-6 text-center text-sm text-red-600`}>
          درخواستی با این کد رهگیری یافت نشد.
        </div>
      </SuccessShell>
    );
  }

  return (
    <SuccessShell>
      <GuestPageHeader
        align="center"
        icon={<SuccessIcon />}
        title="درخواست شما با موفقیت ثبت شد"
        subtitle="به زودی نتیجه بررسی به اطلاع شما خواهد رسید. کد رهگیری را نگه دارید."
      />

      <div className="space-y-4">
        <HonoraryVolunteerTrackingHeader trackingCode={application.trackingCode} compact />

        {application.mawkib ? (
          <MawkibSummaryCard mawkib={application.mawkib} />
        ) : (
          <div className={`${guestTheme.cardLg} text-center text-sm text-slate-500`}>
            موکبی انتخاب نشده است
          </div>
        )}

        <div className={`${guestTheme.cardLg} space-y-4`}>
          <h3 className="text-base font-semibold text-slate-800">خلاصه درخواست</h3>
          <HonoraryVolunteerApplicationDetails application={application} hideHeader hideMawkib />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            to={`/guest/honorary-volunteer/track?trackingCode=${encodeURIComponent(application.trackingCode)}`}
            className={`${guestTheme.btnSecondary} sm:min-w-[180px]`}
          >
            پیگیری درخواست
          </Link>
          <Link to="/honorary-volunteers/my" className={`${guestTheme.btnSecondary} sm:min-w-[180px]`}>
            درخواست‌های من
          </Link>
          <Link to="/" className={`${guestTheme.btnPrimary} sm:min-w-[180px]`}>
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </SuccessShell>
  );
}
