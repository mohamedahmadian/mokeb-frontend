import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GuestPageHeader, GuestShell } from "../components/guest/GuestShell";
import { PilgrimCardScreenView } from "../components/reservations/PilgrimCardScreenView";
import { guestApi } from "../lib/guest";
import { guestTheme } from "../lib/guest-theme";
import {
  buildPilgrimCardUrl,
  getTrackingCodeFromSearchParams,
  reservationTrackPath,
} from "../lib/reservation-track";
import { toast, toastApiError } from "../lib/toast";
import type { Reservation } from "../types";

function IconCard() {
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
        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
      />
    </svg>
  );
}

export function GuestPilgrimCardPage() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = getTrackingCodeFromSearchParams(searchParams);
  const [trackingCode, setTrackingCode] = useState(codeFromUrl);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCard = useCallback(async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) {
      toast.error("لطفاً شناسه رزرو را وارد کنید");
      return;
    }

    setLoading(true);
    setReservation(null);
    try {
      const result = await guestApi.trackReservation(trimmed);
      setReservation(result);
    } catch (err) {
      toastApiError(err, "رزروی با این شناسه یافت نشد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!codeFromUrl) return;
    setTrackingCode(codeFromUrl);
    void loadCard(codeFromUrl);
  }, [codeFromUrl, loadCard]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadCard(trackingCode);
  };

  const trackPath = reservation
    ? reservationTrackPath(reservation.trackingCode)
    : null;
  const shareUrl = reservation
    ? buildPilgrimCardUrl(reservation.trackingCode)
    : null;

  return (
    <GuestShell maxWidth="md">
      <GuestPageHeader
        icon={<IconCard />}
        title="زائر کارت"
        subtitle=""
        align="center"
      />

      <div className="space-y-6">
        {!codeFromUrl && !reservation && (
          <form onSubmit={handleSubmit} className={guestTheme.cardLg}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-600">
                شناسه رزرو
              </span>
              <input
                type="text"
                value={trackingCode}
                onChange={(event) => setTrackingCode(event.target.value)}
                className={`${guestTheme.input} font-mono tracking-wide`}
                placeholder="مثلاً 50415-1"
                dir="ltr"
                autoComplete="off"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className={`${guestTheme.btnPrimaryLg} mt-5 w-full`}
            >
              {loading ? "در حال بارگذاری..." : "نمایش زائر کارت"}
            </button>
          </form>
        )}

        {loading && !reservation && (
          <p className="text-center text-sm text-slate-500">
            در حال بارگذاری زائر کارت...
          </p>
        )}

        {reservation && (
          <>
            <PilgrimCardScreenView reservation={reservation} />

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center">
              {trackPath && (
                <Link
                  to={trackPath}
                  className={`${guestTheme.btnSecondary} text-center sm:min-w-[180px]`}
                >
                  پیگیری جزئیات رزرو
                </Link>
              )}
              <Link
                to="/guest/reserve"
                className={`${guestTheme.btnPrimary} text-center sm:min-w-[180px]`}
              >
                رزرو جدید
              </Link>
            </div>

            {shareUrl && (
              <p className="text-center text-xs leading-relaxed text-slate-400">
                لینک این زائر کارت:
                <br />
                <span className="break-all font-mono" dir="ltr">
                  {shareUrl}
                </span>
              </p>
            )}
          </>
        )}
      </div>
    </GuestShell>
  );
}
