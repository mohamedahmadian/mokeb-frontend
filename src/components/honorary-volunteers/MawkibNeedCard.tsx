import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatPersianDate } from '../ui/PersianDateInput';
import { getServiceTypeLabel } from '../../lib/honorary-volunteer';
import { buildHonoraryVolunteerRegisterFromNeedUrl } from '../../lib/honorary-volunteer-register-prefill';
import { guestDetailTheme, guestTheme } from '../../lib/guest-theme';
import { mawkibCityLabel, type MawkibCity } from '../../lib/mawkib-locations';
import type { HonoraryVolunteerApplication } from '../../types';

function SvgIcon({
  className = 'h-4 w-4',
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
      aria-hidden
    >
      {children}
    </svg>
  );
}

const icons = {
  mawkib: (
    <SvgIcon className="h-5 w-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </SvgIcon>
  ),
  calendar: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </SvgIcon>
  ),
  location: (
    <SvgIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
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
  user: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
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
  services: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
      />
    </SvgIcon>
  ),
  volunteer: (
    <SvgIcon className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </SvgIcon>
  ),
  transport: (
    <SvgIcon className="h-3.5 w-3.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
      />
    </SvgIcon>
  ),
  cleaning: (
    <SvgIcon className="h-3.5 w-3.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </SvgIcon>
  ),
  cooking: (
    <SvgIcon className="h-3.5 w-3.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.39 48.39 0 00-7.478-.12m-12 .12A48.39 48.39 0 005.25 13.5m7.5-3.38v-1.5"
      />
    </SvgIcon>
  ),
  servant: (
    <SvgIcon className="h-3.5 w-3.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </SvgIcon>
  ),
  food: (
    <SvgIcon className="h-3.5 w-3.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </SvgIcon>
  ),
  other: (
    <SvgIcon className="h-3.5 w-3.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </SvgIcon>
  ),
  note: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </SvgIcon>
  ),
};

const serviceTypeIcons: Record<string, ReactNode> = {
  Transportation: icons.transport,
  Cleaning: icons.cleaning,
  Cooking: icons.cooking,
  Servantship: icons.servant,
  FoodSupply: icons.food,
  Other: icons.other,
};

function DetailRow({
  icon,
  label,
  value,
  dir,
  inlinePhone,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  dir?: 'ltr' | 'rtl';
  inlinePhone?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white p-3.5">
      <div className={guestDetailTheme.fieldIcon}>{icon}</div>
      <div className="min-w-0 flex-1 text-right">
        {inlinePhone ? (
          <p className="text-sm text-slate-800">
            <span className="text-xs font-medium text-slate-500">تماس: </span>
            <span dir="ltr" className="font-mono">
              {value}
            </span>
          </p>
        ) : (
          <>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <div className="mt-1 text-sm leading-6 text-slate-800" dir={dir}>
              {value}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function MawkibNeedCard({ need }: { need: HonoraryVolunteerApplication }) {
  const mawkib = need.mawkib;
  const title = mawkib?.name ?? `${need.firstName} ${need.lastName}`;
  const cityLabel = mawkib?.mawkibCity
    ? mawkibCityLabel(mawkib.mawkibCity as MawkibCity)
    : null;
  const startDate = formatPersianDate(need.availabilityStartDate.slice(0, 10));
  const endDate = formatPersianDate(need.availabilityEndDate.slice(0, 10));

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-[#c5d4e8] hover:shadow-md">
      <div className={guestDetailTheme.sectionHeader}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className={guestDetailTheme.sectionIcon}>{icons.mawkib}</div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 sm:text-lg">{title}</h3>
              {cityLabel && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-[#4a6fa5] ring-1 ring-[#c5d4e8]">
                  {icons.location}
                  {cityLabel}
                </span>
              )}
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#e8eef6] px-3 py-1 text-xs font-semibold text-[#3d5d8a]">
            {icons.volunteer}
            نیاز به نیروی خادم
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-l from-[#f0f4fa] to-white p-4 ring-1 ring-[#c5d4e8]/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-[#4a6fa5]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#4a6fa5] shadow-sm ring-1 ring-[#c5d4e8]">
              {icons.calendar}
            </span>
            بازه زمانی همکاری
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span className="rounded-lg bg-white px-3 py-1.5 font-medium shadow-sm ring-1 ring-slate-100">
              از {startDate}
            </span>
            <span className="text-slate-400">←</span>
            <span className="rounded-lg bg-white px-3 py-1.5 font-medium shadow-sm ring-1 ring-slate-100">
              تا {endDate}
            </span>
          </div>
        </div>

        {need.availabilityDescription && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-7 text-slate-600">
            {need.availabilityDescription}
          </p>
        )}

        <div>
          <div className="mb-2.5 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f4fa] text-[#4a6fa5]">
              {icons.services}
            </span>
            <h4 className="text-sm font-semibold text-slate-800">حوزه‌های خدمت مورد نیاز</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {need.serviceTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#c5d4e8] bg-[#f0f4fa] px-3 py-1.5 text-xs font-medium text-[#3d5d8a]"
              >
                <span className="text-[#4a6fa5]">{serviceTypeIcons[type] ?? icons.other}</span>
                {getServiceTypeLabel(type)}
              </span>
            ))}
          </div>
        </div>

        {need.description && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="mb-1.5 flex items-center justify-end gap-2">
              <p className="text-xs font-medium text-slate-500">توضیحات درخواست</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
                {icons.note}
              </span>
            </div>
            <p className="text-right text-sm leading-7 text-slate-700">{need.description}</p>
          </div>
        )}

        {need.serviceDescription && (
          <div className="rounded-xl border-r-4 border-[#4a6fa5] bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">توضیحات خدمت</p>
            <p className="mt-1 text-sm leading-7 text-slate-700">{need.serviceDescription}</p>
          </div>
        )}

        {mawkib && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailRow icon={icons.address} label="آدرس موکب" value={mawkib.address} />
            {mawkib.owner && (
              <DetailRow icon={icons.user} label="مسئول موکب" value={mawkib.owner.fullName} />
            )}
            {(mawkib.phoneNumber?.trim() || mawkib.owner?.mobileNumber) && (
              <DetailRow
                icon={icons.phone}
                label="تماس"
                inlinePhone
                value={mawkib.phoneNumber?.trim() || mawkib.owner?.mobileNumber}
              />
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            برای همکاری با این موکب، آمادگی خود را ثبت کنید.
          </p>
          <Link
            to={buildHonoraryVolunteerRegisterFromNeedUrl(need.id)}
            state={{ fromNeed: need }}
            className={`${guestTheme.btnPrimary} w-full sm:w-auto`}
          >
            {icons.volunteer}
            اعلام آمادگی جهت همکاری
          </Link>
        </div>
      </div>
    </article>
  );
}
