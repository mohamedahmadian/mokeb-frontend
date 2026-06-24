import type { ReactNode } from 'react';
import { formatPersianDateRange } from '../ui/PersianDateRangePicker';
import { formatPersianDate } from '../ui/PersianDateInput';
import { getServiceTypeLabel } from '../../lib/honorary-volunteer';
import { guestDetailTheme } from '../../lib/guest-theme';
import { MawkibSummaryCard } from './MawkibSummaryCard';
import type { HonoraryVolunteerApplication } from '../../types';

const statusLabels: Record<string, string> = {
  Pending: 'در انتظار بررسی',
  Approved: 'تایید شده',
  Rejected: 'رد شده',
  Cancelled: 'لغو شده',
};

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-[#e8eef6] text-[#3d5d8a]',
  Rejected: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-100 text-slate-600',
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="h-5 w-5"
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

const icons = {
  calendar: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </Icon>
  ),
  service: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.955m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.25a7.5 7.5 0 0015 0v-5.25a1.575 1.575 0 013.15 0v3.75m-6.45-3.75h.008v.008H12.75v-.008zm0 3h.008v.008H12.75V15zm0 3h.008v.008H12.75V18z"
      />
    </Icon>
  ),
  note: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </Icon>
  ),
  clock: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </Icon>
  ),
  review: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </Icon>
  ),
  phone: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </Icon>
  ),
  location: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </Icon>
  ),
  registered: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </Icon>
  ),
};

function InfoRow({
  icon,
  label,
  value,
  stacked = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3.5">
        <div className="flex items-center gap-3">
          <div className={guestDetailTheme.fieldIcon}>{icon}</div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </div>
        <div className="mt-2.5 text-sm leading-7 text-slate-700">{value}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3.5">
      <div className="flex items-start gap-3">
        <div className={guestDetailTheme.fieldIcon}>{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <div className="mt-1 text-sm text-slate-800">{value}</div>
        </div>
      </div>
    </div>
  );
}

interface HonoraryVolunteerApplicationDetailsProps {
  application: HonoraryVolunteerApplication;
  showTrackingHeader?: ReactNode;
  showPersonalInfo?: boolean;
  hideHeader?: boolean;
  hideMawkib?: boolean;
}

export function HonoraryVolunteerApplicationDetails({
  application,
  showTrackingHeader,
  showPersonalInfo = false,
  hideHeader = false,
  hideMawkib = false,
}: HonoraryVolunteerApplicationDetailsProps) {
  const locationLabel = [application.province, application.city].filter(Boolean).join('، ');

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-800">
            {application.firstName} {application.lastName}
          </h3>
          <span className={`rounded-full px-2.5 py-1 text-xs ${statusColors[application.status]}`}>
            {statusLabels[application.status]}
          </span>
        </div>
      )}

      {showTrackingHeader}

      {showPersonalInfo && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow
            icon={icons.phone}
            label="شماره موبایل"
            value={
              <span className="font-mono" dir="ltr">
                {application.mobileNumber}
              </span>
            }
          />
          <InfoRow
            icon={icons.registered}
            label="تاریخ ثبت"
            value={formatPersianDate(application.createdAt.slice(0, 10))}
          />
          {locationLabel && (
            <InfoRow icon={icons.location} label="استان / شهر" value={locationLabel} />
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoRow
          icon={icons.calendar}
          label="بازه همکاری"
          value={formatPersianDateRange(
            application.availabilityStartDate.slice(0, 10),
            application.availabilityEndDate.slice(0, 10),
          )}
        />
        <InfoRow
          icon={icons.service}
          label="حوزه‌های خدمت"
          value={
            <div className="flex flex-wrap gap-1.5">
              {application.serviceTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full bg-[#f0f4fa] px-2.5 py-0.5 text-xs text-[#4a6fa5]"
                >
                  {getServiceTypeLabel(type)}
                </span>
              ))}
            </div>
          }
        />
      </div>

      {application.description?.trim() && (
        <InfoRow
          icon={icons.note}
          label="توضیحات درخواست"
          value={application.description}
          stacked
        />
      )}

      {application.serviceDescription?.trim() && (
        <InfoRow
          icon={icons.note}
          label="توضیحات خدمت"
          value={application.serviceDescription}
          stacked
        />
      )}

      {application.availabilityDescription?.trim() && (
        <InfoRow
          icon={icons.clock}
          label="توضیحات ساعات حضور"
          value={application.availabilityDescription}
          stacked
        />
      )}

      {application.reviewNote && (
        <InfoRow
          icon={icons.review}
          label="نتیجه / توضیحات بررسی"
          value={
            <div>
              <p>{application.reviewNote}</p>
              {application.reviewedAt && (
                <p className="mt-2 text-xs text-slate-400">
                  تاریخ بررسی: {formatPersianDate(application.reviewedAt.slice(0, 10))}
                </p>
              )}
            </div>
          }
          stacked
        />
      )}

      {application.mawkib && !hideMawkib && <MawkibSummaryCard mawkib={application.mawkib} />}
    </div>
  );
}
