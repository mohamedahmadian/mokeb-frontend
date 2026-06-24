import type { ReactNode } from 'react';
import { mawkibCityLabel, type MawkibCity } from '../../lib/mawkib-locations';
import { guestDetailTheme, guestTheme } from '../../lib/guest-theme';
import type { HonoraryVolunteerApplication } from '../../types';

type MawkibSummary = NonNullable<HonoraryVolunteerApplication['mawkib']>;

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
  home: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
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
  address: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </Icon>
  ),
  user: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
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
};

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3.5">
      <div className={guestDetailTheme.fieldIcon}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="mt-1 text-sm text-slate-800">{value}</div>
      </div>
    </div>
  );
}

export function MawkibSummaryCard({ mawkib }: { mawkib: MawkibSummary }) {
  return (
    <div className={`${guestTheme.cardLg} space-y-3 text-right`}>
      <div className="flex items-center gap-3">
        <div className={guestDetailTheme.sectionIcon}>{icons.home}</div>
        <h3 className="text-base font-semibold text-slate-800">موکب انتخاب‌شده</h3>
      </div>

      <InfoRow icon={icons.home} label="نام موکب" value={mawkib.name} />

      {mawkib.mawkibCity && (
        <InfoRow
          icon={icons.location}
          label="شهر"
          value={mawkibCityLabel(mawkib.mawkibCity as MawkibCity | null)}
        />
      )}

      <InfoRow icon={icons.address} label="آدرس" value={mawkib.address} />

      {mawkib.owner && (
        <>
          <InfoRow icon={icons.user} label="مسئول موکب" value={mawkib.owner.fullName} />
          <InfoRow
            icon={icons.phone}
            label="موبایل مسئول"
            value={
              <span dir="ltr" className="font-mono">
                {mawkib.owner.mobileNumber}
              </span>
            }
          />
        </>
      )}
    </div>
  );
}
