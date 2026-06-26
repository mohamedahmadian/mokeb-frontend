import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { GuestPageHeader, GuestShell } from "../guest/GuestShell";
import { formatPersianDateRange } from "../ui/PersianDateRangePicker";
import { IconCalendar, IconHome, IconUsers } from "./reservation-form-ui";
import { ReservationTrackingHeader } from "./ReservationTrackingHeader";
import { CompanionsDisplay } from "./CompanionsDisplay";
import { formatGuestCount } from "../../lib/capacity";
import { guestDetailTheme, guestTheme } from "../../lib/guest-theme";
import { buildReservationTrackUrl } from "../../lib/reservation-track";
import type { ReservationFormSuccess } from "./ReservationForm";

type GuestSuccess = Extract<ReservationFormSuccess, { variant: "guest" }>;

function SuccessIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function IconKey() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499a1.125 1.125 0 011.591 0l.879.879m0 0l3.75 3.75M9.75 8.25l3.75 3.75"
      />
    </svg>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-3.5">
      <div className={guestDetailTheme.fieldIcon}>{icon}</div>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}

export function GuestReservationSuccessView({
  success,
}: {
  success: GuestSuccess;
}) {
  const passwordHint = success.loginPasswordHint;
  const trackUrl = buildReservationTrackUrl(success.trackingCode);

  return (
    <GuestShell maxWidth="lg">
      <GuestPageHeader
        align="center"
        icon={<SuccessIcon />}
        title="رزرو اولیه با موفقیت ثبت شد"
        subtitle="پس از بررسی موکب‌دار، رزرو شما قطعی می‌شود. شناسه رزرو را نگه دارید."
      />

      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-l from-amber-50 via-white to-white shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-sm font-semibold text-amber-900">
                در انتظار تایید موکب‌دار
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80">
                تا زمان تایید، رزرو شما در وضعیت «در انتظار» باقی می‌ماند.
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 sm:inline">
              در انتظار
            </span>
          </div>
        </div>

        <ReservationTrackingHeader
          trackingCode={success.trackingCode}
          compact
          variant="guest"
        />

        <div className={`${guestTheme.cardLg} space-y-4`}>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h3 className="text-base font-semibold text-slate-800">
              خلاصه رزرو
            </h3>
            <span className="rounded-lg bg-[#f0f4fa] px-2.5 py-1 text-xs font-medium text-[#4a6fa5] ring-1 ring-[#c5d4e8]">
              رزرو اولیه
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SummaryTile
              icon={<IconHome />}
              label="موکب"
              value={success.mawkibName}
            />
            <SummaryTile
              icon={<IconUsers />}
              label="تعداد نفرات"
              value={formatGuestCount(
                success.maleGuestCount,
                success.femaleGuestCount,
              )}
            />
            <SummaryTile
              icon={<IconCalendar />}
              label="بازه اقامت"
              value={
                <span className="font-medium">
                  {formatPersianDateRange(
                    success.reservationDate,
                    success.reservationEndDate,
                  )}
                </span>
              }
            />
            <SummaryTile
              icon={<IconKey />}
              label="موبایل ثبت‌شده"
              value={
                <span className="font-mono tracking-wide" dir="ltr">
                  {success.mobileNumber}
                </span>
              }
            />
          </div>

          {success.companions && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <div className={guestDetailTheme.fieldIcon}>
                  <IconUsers />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  مشخصات همراهان
                </h4>
              </div>
              <CompanionsDisplay companions={success.companions} compact />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#c5d4e8] bg-[#f0f4fa]/60 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className={`${guestDetailTheme.fieldIcon} mt-0.5`}>
              <IconKey />
            </div>
            <div className="text-right text-sm leading-relaxed text-slate-600">
              <p className="font-medium text-slate-800">ورود به پنل کاربری</p>
              <p className="mt-1">
                برای پیگیری وضعیت رزرو، با موبایل خود و رمز عبور{" "}
                <span className="font-mono font-bold text-[#4a6fa5]" dir="ltr">
                  {passwordHint}
                </span>{" "}
                وارد پنل شوید.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            to="/login"
            className={`${guestTheme.btnPrimary} sm:min-w-[180px]`}
          >
            ورود به پنل کاربری
          </Link>
          <Link
            to={trackUrl}
            className={`${guestTheme.btnSecondary} sm:min-w-[180px]`}
          >
            پیگیری رزرو
          </Link>
        </div>
      </div>
    </GuestShell>
  );
}
