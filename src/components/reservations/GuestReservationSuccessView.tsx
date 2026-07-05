import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GuestPageHeader, GuestShell } from "../guest/GuestShell";
import { ReservationTrackingHeader } from "./ReservationTrackingHeader";
import { PilgrimCardScreenView } from "./PilgrimCardScreenView";
import { guestApi } from "../../lib/guest";
import { buildReservationFromGuestSuccess } from "../../lib/guest-success-reservation";
import { guestDetailTheme, guestTheme } from "../../lib/guest-theme";
import {
  pilgrimCardPath,
  reservationTrackPath,
} from "../../lib/reservation-track";
import type { Reservation } from "../../types";
import type { ReservationFormSuccess } from "./ReservationForm";

type GuestSuccess = Extract<ReservationFormSuccess, { variant: "guest" }>;

const FAST_MODE_CARD_HINT =
  "لطفاً از این کارت عکس تهیه فرمایید و همراه خود داشته باشید.";

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

export function GuestReservationSuccessView({
  success,
}: {
  success: GuestSuccess;
}) {
  const passwordHint = success.loginPasswordHint;
  const isFastMode = success.guestReservationMode === "fast";
  const initialReservation = useMemo(
    () => (isFastMode ? buildReservationFromGuestSuccess(success) : null),
    [isFastMode, success],
  );
  const [reservation, setReservation] = useState<Reservation | null>(
    initialReservation,
  );
  const [cardLoading, setCardLoading] = useState(!isFastMode);

  useEffect(() => {
    let cancelled = false;

    if (isFastMode) {
      setReservation(buildReservationFromGuestSuccess(success));
      setCardLoading(false);
    } else {
      setCardLoading(true);
      setReservation(null);
    }

    void guestApi
      .trackReservation(success.trackingCode)
      .then((result) => {
        if (!cancelled) setReservation(result);
      })
      .catch(() => {
        if (!cancelled && !isFastMode) setReservation(null);
      })
      .finally(() => {
        if (!cancelled && !isFastMode) setCardLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isFastMode, success]);

  const actionButtonClass = `${guestTheme.btnSecondary} w-full sm:w-auto`;

  return (
    <GuestShell maxWidth="lg">
      <GuestPageHeader
        align="center"
        icon={<SuccessIcon />}
        title="رزرو موقت انجام شد"
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
                تا زمان تایید توسط موکب دار محترم، رزرو شما در وضعیت «در انتظار»
                باقی می‌ماند.
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 sm:inline">
              در انتظار
            </span>
          </div>
        </div>

        {isFastMode && reservation && (
          <div className={`${guestTheme.cardLg} space-y-1`}>
            <h3 className="text-center text-base font-semibold text-slate-800">
              زائر کارت
            </h3>
            <PilgrimCardScreenView
              reservation={reservation}
              showPrintButton
              showDownloadButton
              hintMessage={FAST_MODE_CARD_HINT}
              printButtonClassName={actionButtonClass}
              downloadButtonClassName={actionButtonClass}
            />
          </div>
        )}

        {!isFastMode && cardLoading && (
          <p className="text-center text-sm text-slate-500">
            در حال آماده‌سازی زائر کارت...
          </p>
        )}

        {!isFastMode && reservation && (
          <PilgrimCardScreenView
            reservation={reservation}
            printButtonClassName={actionButtonClass}
          />
        )}

        {!isFastMode && !cardLoading && !reservation && (
          <ReservationTrackingHeader
            trackingCode={success.trackingCode}
            compact
            variant="guest"
          />
        )}

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
            to={reservationTrackPath(success.trackingCode)}
            className={`${guestTheme.btnSecondary} sm:min-w-[180px]`}
          >
            پیگیری رزرو
          </Link>
          {!isFastMode && !reservation && (
            <Link
              to={pilgrimCardPath(success.trackingCode)}
              className={`${guestTheme.btnSecondary} sm:min-w-[180px]`}
            >
              مشاهده زائر کارت
            </Link>
          )}
        </div>
      </div>
    </GuestShell>
  );
}
