import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { GuestPageHeader, GuestShell } from "../components/guest/GuestShell";
import { HonoraryVolunteerApplicationDetails } from "../components/honorary-volunteers/HonoraryVolunteerApplicationDetails";
import { HonoraryVolunteerTrackingHeader } from "../components/honorary-volunteers/HonoraryVolunteerTrackingHeader";
import { honoraryVolunteersApi } from "../lib/honorary-volunteers";
import { guestTheme } from "../lib/guest-theme";
import type { HonoraryVolunteerApplication } from "../types";

function ApplicationResult({
  application,
}: {
  application: HonoraryVolunteerApplication;
}) {
  return (
    <div className={guestTheme.cardLg}>
      <HonoraryVolunteerApplicationDetails
        application={application}
        showTrackingHeader={
          <HonoraryVolunteerTrackingHeader
            trackingCode={application.trackingCode}
            compact
          />
        }
      />
    </div>
  );
}

type TrackMode = "code" | "mobile";

export function HonoraryVolunteerTrackPage() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("trackingCode") ?? "";
  const [mode, setMode] = useState<TrackMode>("code");
  const [trackingCode, setTrackingCode] = useState(codeFromUrl);
  const [mobileNumber, setMobileNumber] = useState("");
  const [lookupCode, setLookupCode] = useState(codeFromUrl);
  const [lookupMobile, setLookupMobile] = useState("");

  const codeQuery = useQuery({
    queryKey: ["honorary-volunteer-track", lookupCode],
    queryFn: () => honoraryVolunteersApi.track(lookupCode),
    enabled: Boolean(lookupCode) && mode === "code",
    retry: false,
  });

  const mobileQuery = useQuery({
    queryKey: ["honorary-volunteer-track-mobile", lookupMobile],
    queryFn: () => honoraryVolunteersApi.trackByMobile(lookupMobile),
    enabled: Boolean(lookupMobile) && mode === "mobile",
    retry: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "code") {
      setLookupCode(trackingCode.trim());
      setLookupMobile("");
    } else {
      setLookupMobile(mobileNumber.trim());
      setLookupCode("");
    }
  };

  const switchMode = (next: TrackMode) => {
    setMode(next);
    setLookupCode("");
    setLookupMobile("");
  };

  return (
    <GuestShell maxWidth="lg">
      <GuestPageHeader
        icon={
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
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        }
        title="پیگیری درخواست همکاری به عنوان خادم"
        subtitle="با کد درخواست یا شماره تلفن، وضعیت و نتیجه بررسی را مشاهده کنید"
      />

      <form
        onSubmit={handleSubmit}
        className={`${guestTheme.cardLg} mb-4 space-y-4`}
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => switchMode("code")}
            className={`rounded-lg px-3 py-2 text-sm ${
              mode === "code"
                ? "bg-[#4a6fa5] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            کد درخواست
          </button>
          <button
            type="button"
            onClick={() => switchMode("mobile")}
            className={`rounded-lg px-3 py-2 text-sm ${
              mode === "mobile"
                ? "bg-[#4a6fa5] text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            شماره تلفن
          </button>
        </div>

        {mode === "code" ? (
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-600">
              کد درخواست همکاری به عنوان خادم
            </span>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              className={guestTheme.input}
              dir="ltr"
              placeholder="KHD-..."
              required
            />
          </label>
        ) : (
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-600">
              شماره تلفن ثبت‌شده
            </span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className={guestTheme.input}
              dir="ltr"
              placeholder="09..."
              required
            />
          </label>
        )}

        <button type="submit" className={guestTheme.btnPrimaryLg}>
          مشاهده نتیجه
        </button>
      </form>

      {mode === "code" && lookupCode && (
        <>
          {codeQuery.isLoading && (
            <p className="text-slate-500">در حال جستجو...</p>
          )}
          {codeQuery.isError && (
            <div
              className={`${guestTheme.card} p-6 text-center text-sm text-red-600`}
            >
              درخواستی با این کد یافت نشد
            </div>
          )}
          {codeQuery.data && <ApplicationResult application={codeQuery.data} />}
        </>
      )}

      {mode === "mobile" && lookupMobile && (
        <>
          {mobileQuery.isLoading && (
            <p className="text-slate-500">در حال جستجو...</p>
          )}
          {mobileQuery.isError && (
            <div
              className={`${guestTheme.card} p-6 text-center text-sm text-red-600`}
            >
              درخواستی با این شماره یافت نشد
            </div>
          )}
          {mobileQuery.data && mobileQuery.data.length === 0 && (
            <div
              className={`${guestTheme.card} p-6 text-center text-slate-400`}
            >
              درخواستی با این شماره یافت نشد
            </div>
          )}
          {mobileQuery.data && mobileQuery.data.length > 0 && (
            <div className="space-y-4">
              {mobileQuery.data.map((app) => (
                <ApplicationResult key={app.id} application={app} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-6 text-center">
        <Link to="/" className={guestTheme.btnGhost}>
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </GuestShell>
  );
}
