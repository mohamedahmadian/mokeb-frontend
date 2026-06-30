import type { ReactNode } from "react";
import { formatPersianDate } from "../ui/PersianDateInput";
import {
  MAWKIB_AMENITY_FIELDS,
  MAWKIB_NOTIFY_FIELDS,
} from "../mawkibs/MawkibExtraFields";
import {
  formatCapacityFractionLatin,
  mawkibAvailableFemale,
  mawkibAvailableMale,
} from "../../lib/capacity";
import { RemainingCapacityHint } from "./RemainingCapacityHint";
import {
  mawkibCityLabel,
  mawkibCountryLabel,
} from "../../lib/mawkib-locations";
import { guestTheme } from "../../lib/guest-theme";
import {
  ONLINE_RESERVATION_DISABLED_LABEL,
  isMawkibOnlineReservationEnabled,
} from "../../lib/mawkib-online-reservation";
import type { Mawkib } from "../../types";
import { MawkibLocationMapTrigger } from "./MawkibLocationMapTrigger";

function Icon({
  children,
  className = "h-5 w-5",
}: {
  children: ReactNode;
  className?: string;
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
  home: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </Icon>
  ),
  id: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a2.25 2.25 0 001.423-1.423l3.114-1.035a48.34 48.34 0 00-8.838-5.882z"
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
  user: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </Icon>
  ),
  location: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
      />
    </Icon>
  ),
  globe: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </Icon>
  ),
  city: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008H17.25v-.008zm0 3h.008v.008H17.25v-.008zm0 3h.008v.008H17.25v-.008z"
      />
    </Icon>
  ),
  address: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-1.5m-15 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5v-1.875a1.125 1.125 0 00-1.125-1.125h-1.5"
      />
    </Icon>
  ),
  shrine: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6M4.5 10.5V21h15V10.5"
      />
    </Icon>
  ),
  coordinates: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934a1.125 1.125 0 01-1.006 0L9.75 4.82c-.836-.375-1.628.125-1.628 1.006v9.644c0 .426.241.816.622 1.006l3.128 1.564"
      />
    </Icon>
  ),
  calendar: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
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
  male: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </Icon>
  ),
  female: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </Icon>
  ),
  services: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"
      />
    </Icon>
  ),
  note: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </Icon>
  ),
  social: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </Icon>
  ),
  link: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    </Icon>
  ),
  rules: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </Icon>
  ),
  amenities: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </Icon>
  ),
  check: (
    <Icon className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </Icon>
  ),
  map: (
    <Icon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934a1.125 1.125 0 01-1.006 0L9.75 4.82c-.836-.375-1.628.125-1.628 1.006v9.644c0 .426.241.816.622 1.006l3.128 1.564"
      />
    </Icon>
  ),
};

const AMENITY_ICONS: Record<
  (typeof MAWKIB_AMENITY_FIELDS)[number]["key"],
  ReactNode
> = {
  breakfastReception: icons.calendar,
  lunchReception: icons.calendar,
  dinnerReception: icons.calendar,
  bathroom: icons.home,
  laundry: icons.services,
  parking: icons.location,
  internet: icons.link,
  familyFriendly: icons.user,
};

const SOCIAL_ICONS: Record<
  (typeof MAWKIB_NOTIFY_FIELDS)[number]["key"],
  ReactNode
> = {
  telegramChannel: icons.social,
  whatsapp: icons.phone,
  bale: icons.social,
  eitaa: icons.social,
  websiteUrl: icons.link,
};

function IconBadge({ icon, size = "md" }: { icon: ReactNode; size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-6 w-6 rounded-md" : "h-7 w-7 rounded-lg";
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-[#f0f4fa] text-[#4a6fa5] [&_svg]:h-3.5 [&_svg]:w-3.5 ${box}`}
    >
      {icon}
    </span>
  );
}

function DetailSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa]/60 to-white px-3 py-2">
        <IconBadge icon={icon} />
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100 px-3 py-1">{children}</div>
    </section>
  );
}

function PairFieldRow({
  icon,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  icon: ReactNode;
  leftLabel: string;
  leftValue: ReactNode;
  rightLabel: string;
  rightValue: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 py-2">
      <IconBadge icon={icon} />
      <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium text-slate-400">{leftLabel}</p>
          <div className="text-sm font-medium text-slate-800">{leftValue}</div>
        </div>
        <div className="min-w-0 sm:border-s sm:border-slate-100 sm:ps-3">
          <p className="text-[10px] font-medium text-slate-400">{rightLabel}</p>
          <div className="text-sm text-slate-800">{rightValue}</div>
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  icon,
  label,
  value,
  stacked,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  stacked?: boolean;
}) {
  return (
    <div className={`flex gap-2 py-2 ${stacked ? "items-start" : "items-center"}`}>
      <IconBadge icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-slate-400">{label}</p>
        <div className="text-sm leading-snug text-slate-800">{value}</div>
      </div>
    </div>
  );
}

function CapacityDetailRow({
  icon,
  label,
  available,
  total,
}: {
  icon: ReactNode;
  label: string;
  available: number;
  total: number;
}) {
  const hasAvailability = available > 0;

  return (
    <div className="flex min-w-0 items-start gap-1.5 rounded-lg bg-[#f0f4fa] px-2 py-2 ring-1 ring-[#e8eef6]">
      <IconBadge icon={icon} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] text-slate-500">{label}</p>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs sm:text-sm">
          <span
            className={`shrink-0 font-mono font-bold tabular-nums ${hasAvailability ? "text-[#4a6fa5]" : "text-amber-600"}`}
            title="رزرو شده / ظرفیت کل"
          >
            {formatCapacityFractionLatin(available, total)}
          </span>
          <RemainingCapacityHint
            available={available}
            numerals="latin"
            className="text-slate-500"
            fullClassName="text-[10px] font-semibold text-red-600 sm:text-[11px]"
          />
        </div>
      </div>
    </div>
  );
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

interface MawkibPublicDetailProps {
  mawkib: Mawkib;
  onViewCapacity?: () => void;
  focusMap?: boolean;
}

export function MawkibPublicDetail({
  mawkib,
  onViewCapacity,
  focusMap = false,
}: MawkibPublicDetailProps) {
  const activeAmenities = MAWKIB_AMENITY_FIELDS.filter((f) => mawkib[f.key]);
  const socialLinks = MAWKIB_NOTIFY_FIELDS.filter((f) =>
    hasText(mawkib[f.key]),
  );

  return (
    <div className="space-y-3">
      {!isMawkibOnlineReservationEnabled(mawkib) && (
        <div
          role="alert"
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-700"
        >
          {ONLINE_RESERVATION_DISABLED_LABEL} — امکان ثبت درخواست رزرو آنلاین برای این
          موکب وجود ندارد. برای هماهنگی با موکب‌دار تماس بگیرید.
        </div>
      )}
      <DetailSection icon={icons.home} title="موکب">
        <PairFieldRow
          icon={icons.home}
          leftLabel="نام موکب"
          leftValue={mawkib.name}
          rightLabel="شماره تماس"
          rightValue={<span className="font-mono">{mawkib.phoneNumber}</span>}
        />
        {mawkib.owner && (
          <PairFieldRow
            icon={icons.user}
            leftLabel="مسئول موکب"
            leftValue={mawkib.owner.fullName}
            rightLabel="موبایل مسئول"
            rightValue={
              mawkib.owner.mobileNumber ? (
                <span className="font-mono">{mawkib.owner.mobileNumber}</span>
              ) : (
                <span className="text-slate-400">—</span>
              )
            }
          />
        )}
      </DetailSection>

      <DetailSection icon={icons.calendar} title="ظرفیت و زمان‌بندی">
        <div className="grid grid-cols-2 gap-2 py-2">
          <CapacityDetailRow
            icon={icons.male}
            label="ظرفیت آقایان"
            available={mawkibAvailableMale(mawkib)}
            total={mawkib.maleCapacity}
          />
          <CapacityDetailRow
            icon={icons.female}
            label="ظرفیت بانوان"
            available={mawkibAvailableFemale(mawkib)}
            total={mawkib.femaleCapacity}
          />
        </div>
        {onViewCapacity && (
          <button
            type="button"
            onClick={onViewCapacity}
            className={`${guestTheme.btnPrimary} mb-1 w-full`}
          >
            مشاهده ظرفیت موکب
          </button>
        )}
        {mawkib.serviceStartDate && (
          <FieldRow
            icon={icons.calendar}
            label="شروع خدمات"
            value={formatPersianDate(mawkib.serviceStartDate.slice(0, 10))}
          />
        )}
        {mawkib.serviceEndDate && (
          <FieldRow
            icon={icons.calendar}
            label="پایان خدمات"
            value={formatPersianDate(mawkib.serviceEndDate.slice(0, 10))}
          />
        )}
        {mawkib.maxReservationDays != null && mawkib.maxReservationDays > 0 && (
          <FieldRow
            icon={icons.clock}
            label="حداکثر روز رزرو"
            value={`${mawkib.maxReservationDays} روز`}
          />
        )}
      </DetailSection>

      <DetailSection icon={icons.location} title="موقعیت مکانی">
        <PairFieldRow
          icon={icons.globe}
          leftLabel="کشور"
          leftValue={mawkibCountryLabel(mawkib.country)}
          rightLabel="شهر زیارتی"
          rightValue={
            mawkib.mawkibCity ? (
              mawkibCityLabel(mawkib.mawkibCity)
            ) : (
              <span className="text-slate-400">—</span>
            )
          }
        />
        <FieldRow
          icon={icons.address}
          label="آدرس"
          stacked
          value={<p className="whitespace-pre-wrap leading-relaxed">{mawkib.address}</p>}
        />
        {hasText(mawkib.distanceToShrine) && (
          <FieldRow
            icon={icons.shrine}
            label="فاصله تا حرم"
            value={mawkib.distanceToShrine}
          />
        )}
        {(mawkib.latitude != null || mawkib.longitude != null) && (
          <PairFieldRow
            icon={icons.coordinates}
            leftLabel="عرض جغرافیایی"
            leftValue={
              mawkib.latitude != null ? (
                <span className="font-mono" dir="ltr">
                  {mawkib.latitude}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )
            }
            rightLabel="طول جغرافیایی"
            rightValue={
              mawkib.longitude != null ? (
                <span className="font-mono" dir="ltr">
                  {mawkib.longitude}
                </span>
              ) : (
                <span className="text-slate-400">—</span>
              )
            }
          />
        )}
        <div id="mawkib-map" className="py-1 scroll-mt-24">
          <p className="mb-2 text-xs text-slate-500">موقعیت روی نقشه</p>
          <MawkibLocationMapTrigger
            latitude={mawkib.latitude}
            longitude={mawkib.longitude}
            mawkibName={mawkib.name}
            defaultOpen={focusMap}
          />
        </div>
      </DetailSection>

      {activeAmenities.length > 0 && (
        <DetailSection icon={icons.amenities} title="امکانات">
          <div className="grid grid-cols-1 gap-1.5 py-2 sm:grid-cols-2">
            {activeAmenities.map((item) => (
              <div
                key={item.key}
                className="flex items-center gap-2 rounded-lg bg-[#f0f4fa] px-2.5 py-1.5 text-[#3d5d8a] ring-1 ring-[#e8eef6]"
              >
                <IconBadge icon={AMENITY_ICONS[item.key]} size="sm" />
                <span className="flex-1 text-xs sm:text-sm">{item.label}</span>
                <span className="text-[#4a6fa5]">{icons.check}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {hasText(mawkib.services) && (
        <DetailSection icon={icons.services} title="خدمات">
          <FieldRow
            icon={icons.services}
            label="خدمات موکب"
            stacked
            value={
              <p className="whitespace-pre-wrap leading-relaxed">{mawkib.services}</p>
            }
          />
        </DetailSection>
      )}

      {hasText(mawkib.description) && (
        <DetailSection icon={icons.note} title="توضیحات">
          <FieldRow
            icon={icons.note}
            label="توضیحات"
            stacked
            value={
              <p className="whitespace-pre-wrap leading-relaxed">{mawkib.description}</p>
            }
          />
        </DetailSection>
      )}

      {hasText(mawkib.rules) && (
        <DetailSection icon={icons.rules} title="قوانین موکب">
          <FieldRow
            icon={icons.rules}
            label="قوانین"
            stacked
            value={
              <p className="whitespace-pre-wrap leading-relaxed">{mawkib.rules}</p>
            }
          />
        </DetailSection>
      )}

      {socialLinks.length > 0 && (
        <DetailSection icon={icons.social} title="شبکه‌های اجتماعی">
          {socialLinks.map((item) => {
            const value = mawkib[item.key]!.trim();
            return (
              <FieldRow
                key={item.key}
                icon={SOCIAL_ICONS[item.key]}
                label={item.label}
                value={
                  item.key === "websiteUrl" ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-mono text-[#4a6fa5] hover:underline"
                      dir="ltr"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="break-all font-mono" dir="ltr">
                      {value}
                    </span>
                  )
                }
              />
            );
          })}
        </DetailSection>
      )}
    </div>
  );
}
