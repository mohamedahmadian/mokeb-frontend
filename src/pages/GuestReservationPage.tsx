import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ProvinceCitySelect } from "../components/ui/ProvinceCitySelect";
import {
  formatPersianDateRange,
  PersianDateRangePicker,
} from "../components/ui/PersianDateRangePicker";
import { formatPersianDate } from "../components/ui/PersianDateInput";
import {
  isOnOrAfterServiceStart,
  isWithinMaxReservationDays,
} from "../lib/date-range";
import { getApiErrorMessage } from "../lib/constants";
import { guestApi } from "../lib/guest";
import { mawkibsApi } from "../lib/mawkibs";
import { formatCapacityLine } from "../lib/capacity";
import { GuestPageHeader, GuestShell } from "../components/guest/GuestShell";
import { ReservationTrackingHeader } from "../components/reservations/ReservationTrackingHeader";
import { guestTheme } from "../lib/guest-theme";
import type { Mawkib } from "../types";

function mawkibCapacitySnapshot(mawkib: Mawkib) {
  return {
    maleCapacity: mawkib.maleCapacity,
    femaleCapacity: mawkib.femaleCapacity,
    availableMale: mawkib.availableMaleCapacity ?? mawkib.maleCapacity,
    availableFemale: mawkib.availableFemaleCapacity ?? mawkib.femaleCapacity,
  };
}

function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function IconUser() {
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
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function IconCalendar() {
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
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function IconHome() {
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
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function IconUsers() {
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
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function IconChat() {
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
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function MawkibCard({
  mawkib,
  selected,
  onSelect,
}: {
  mawkib: Mawkib;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border-2 p-4 text-right transition-all ${
        selected
          ? "border-[#4a6fa5] bg-[#f0f4fa] shadow-md shadow-[#c5d4e8]/40"
          : "border-slate-200 bg-white hover:border-[#c5d4e8] hover:bg-[#f0f4fa]/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-800">{mawkib.name}</p>
          <p className="mt-1 text-sm text-slate-500 line-clamp-2">
            {mawkib.address}
          </p>
          {(mawkib.owner?.province || mawkib.owner?.city) && (
            <p className="mt-1 text-xs text-slate-400">
              {[mawkib.owner?.province, mawkib.owner?.city]
                .filter(Boolean)
                .join("، ")}
            </p>
          )}
        </div>
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-[#4a6fa5] bg-[#4a6fa5]" : "border-slate-300"
          }`}
        >
          {selected && (
            <svg
              className="h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#e8eef6] px-2.5 py-0.5 text-xs font-medium text-[#3d5d8a]">
          ظرفیت باقی‌مانده:{" "}
          {formatCapacityLine(mawkibCapacitySnapshot(mawkib), "available")}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
          ظرفیت کل:{" "}
          {formatCapacityLine(mawkibCapacitySnapshot(mawkib), "total")}
        </span>
      </div>
    </button>
  );
}

function GuestCountStepper({
  value,
  onChange,
  max,
  min = 0,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  min?: number;
  label: string;
}) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => {
    const next = value + 1;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  return (
    <div>
      <span className="mb-2 block text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-700 transition hover:border-[#c5d4e8] hover:bg-[#f0f4fa] disabled:opacity-40"
          aria-label="کاهش"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isNaN(n) || n < min) onChange(min);
            else if (max !== undefined && n > max) onChange(max);
            else onChange(n);
          }}
          className="h-11 w-20 rounded-xl border border-slate-200 text-center text-lg font-semibold text-slate-800 focus:border-[#4a6fa5] focus:outline-none"
        />
        <button
          type="button"
          onClick={increment}
          disabled={max !== undefined && value >= max}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-medium text-slate-700 transition hover:border-[#c5d4e8] hover:bg-[#f0f4fa] disabled:opacity-40"
          aria-label="افزایش"
        >
          +
        </button>
        <span className="text-sm text-slate-500">نفر</span>
      </div>
    </div>
  );
}

const inputClass = guestTheme.input;

export function GuestReservationPage() {
  const [searchParams] = useSearchParams();
  const initialMawkibId = searchParams.get("mawkibId");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const today = todayDateString();
  const [dateStart, setDateStart] = useState(today);
  const [dateEnd, setDateEnd] = useState(today);
  const [maleGuestCount, setMaleGuestCount] = useState(1);
  const [femaleGuestCount, setFemaleGuestCount] = useState(0);
  const [selectedMawkibId, setSelectedMawkibId] = useState<number | null>(() => {
    if (!initialMawkibId) return null;
    const id = parseInt(initialMawkibId, 10);
    return Number.isNaN(id) ? null : id;
  });
  const [companions, setCompanions] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    message: string;
    mawkibName: string;
    reservationDate: string;
    reservationEndDate: string;
    maleGuestCount: number;
    femaleGuestCount: number;
    trackingCode: string;
    mobileNumber: string;
  } | null>(null);

  const {
    data: mawkibs = [],
    isLoading: mawkibsLoading,
    isError: mawkibsError,
  } = useQuery({
    queryKey: [
      "guest-mawkibs",
      dateStart,
      dateEnd,
      maleGuestCount,
      femaleGuestCount,
    ],
    queryFn: () =>
      mawkibsApi.getPublicList({
        reservationDateFrom: dateStart,
        reservationDateTo: dateEnd,
        hasAvailability: true,
        minAvailableMaleCapacity: maleGuestCount,
        minAvailableFemaleCapacity: femaleGuestCount,
      }),
    enabled: !!dateStart && !!dateEnd && maleGuestCount + femaleGuestCount >= 1,
  });

  const hasCapacity = !mawkibsError && mawkibs.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("نام و نام خانوادگی را وارد کنید");
      return;
    }
    if (!mobileNumber.trim()) {
      setError("شماره موبایل را وارد کنید");
      return;
    }
    if (!selectedMawkibId) {
      setError("لطفاً یک موکب انتخاب کنید");
      return;
    }

    const selectedMawkib = mawkibs.find((m) => m.id === selectedMawkibId);
    if (
      selectedMawkib?.serviceStartDate &&
      !isOnOrAfterServiceStart(dateStart, selectedMawkib.serviceStartDate)
    ) {
      setError(
        `تاریخ شروع رزرو نمی‌تواند قبل از شروع خدمات موکب (${formatPersianDate(selectedMawkib.serviceStartDate.slice(0, 10))}) باشد`,
      );
      return;
    }

    if (
      selectedMawkib?.maxReservationDays &&
      !isWithinMaxReservationDays(
        dateStart,
        dateEnd,
        selectedMawkib.maxReservationDays,
      )
    ) {
      setError(
        `حداکثر بازه رزرو برای این موکب ${selectedMawkib.maxReservationDays} روز است`,
      );
      return;
    }

    if (maleGuestCount + femaleGuestCount < 1) {
      setError("حداقل یک نفر (آقا یا خانم) باید وارد شود");
      return;
    }

    if (!hasCapacity) {
      setError("در حال حاضر ظرفیت خالی وجود ندارد");
      return;
    }

    setSubmitting(true);
    try {
      const result = await guestApi.createReservation({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobileNumber: mobileNumber.trim(),
        province: province.trim() || undefined,
        city: city.trim() || undefined,
        mawkibId: selectedMawkibId,
        reservationDate: dateStart,
        reservationEndDate: dateEnd,
        maleGuestCount,
        femaleGuestCount,
        companions: companions.trim() || undefined,
        description: description.trim() || undefined,
      });
      setSuccess({
        message: result.message,
        mawkibName: result.mawkibName,
        reservationDate: result.reservationDate,
        reservationEndDate: result.reservationEndDate,
        maleGuestCount: result.maleGuestCount,
        femaleGuestCount: result.femaleGuestCount,
        trackingCode: result.trackingCode,
        mobileNumber: mobileNumber.trim(),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        getApiErrorMessage(err, "خطا در ثبت درخواست. لطفاً دوباره تلاش کنید"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const passwordHint = success.mobileNumber.replace(/\D/g, "").slice(-4);
    return (
      <GuestShell maxWidth="md">
        <div className={`${guestTheme.card} p-6 text-center sm:p-8`}>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8eef6]">
            <svg
              className="h-8 w-8 text-[#4a6fa5]"
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
          </div>

          <div className="rounded-xl border border-[#c5d4e8] bg-[#f0f4fa] p-5 text-right sm:p-6">
            <p className="text-base font-bold text-[#3d5d8a] sm:text-lg">
              رزرواسیون شما با موفقیت ثبت اولیه شد
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              پس از بررسی نهایی توسط موکب‌دار محترم، رزرواسیون شما تایید خواهد شد
            </p>
          </div>

          <div className="mt-5">
            <ReservationTrackingHeader
              trackingCode={success.trackingCode}
              compact
              variant="guest"
            />
          </div>

            <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4 text-right text-sm text-slate-700">
              <p>
                <span className="text-slate-500">موکب:</span>{" "}
                {success.mawkibName}
              </p>
              <p>
                <span className="text-slate-500">بازه تاریخ:</span>{" "}
                {formatPersianDateRange(
                  success.reservationDate,
                  success.reservationEndDate,
                )}
              </p>
              <p>
                <span className="text-slate-500">تعداد نفرات:</span> آقایان:{" "}
                {success.maleGuestCount} — خانم‌ها: {success.femaleGuestCount}
              </p>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              برای پیگیری وضعیت، با شماره موبایل و رمز عبور{" "}
              <span className="font-mono font-semibold text-slate-700">
                {passwordHint}
              </span>{" "}
              (۴ رقم آخر موبایل) وارد پنل شوید.
            </p>

            <Link to="/login" className={`${guestTheme.btnPrimary} mt-8 sm:min-w-[220px]`}>
              ورود به پنل کاربری
            </Link>
          </div>
      </GuestShell>
    );
  }

  return (
    <GuestShell maxWidth="lg">
      <GuestPageHeader icon={<IconHome />} title="رزرو موکب" />

      <form onSubmit={handleSubmit} className={`${guestTheme.cardLg} space-y-6`}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* personal info */}
          <section>
            <SectionHeader icon={<IconUser />} title="اطلاعات شما" />
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-600">
                    نام *
                  </span>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    placeholder="مثلاً علی"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-slate-600">
                    نام خانوادگی *
                  </span>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    placeholder="مثلاً محمدی"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">
                  شماره موبایل *
                </span>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className={inputClass}
                  placeholder="09121234567"
                  dir="ltr"
                />
                <p className="mt-1 text-xs text-slate-400">
                  رمز عبور شما: ۴ رقم آخر موبایل
                </p>
              </label>
              <ProvinceCitySelect
                province={province}
                city={city}
                onProvinceChange={setProvince}
                onCityChange={setCity}
              />
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* date & guests */}
          <section>
            <SectionHeader
              icon={<IconCalendar />}
              title="زمان و تعداد"
              subtitle="بازه تاریخ اقامت و تعداد آقایان و خانم‌ها را مشخص کنید"
            />
            <div className="space-y-4">
              <PersianDateRangePicker
                startDate={dateStart}
                endDate={dateEnd}
                onChange={(start, end) => {
                  setDateStart(start);
                  setDateEnd(end);
                  setSelectedMawkibId(null);
                }}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <GuestCountStepper
                  label="تعداد آقایان *"
                  value={maleGuestCount}
                  onChange={(n) => {
                    setMaleGuestCount(n);
                    setSelectedMawkibId(null);
                  }}
                />
                <GuestCountStepper
                  label="تعداد خانم‌ها *"
                  value={femaleGuestCount}
                  onChange={(n) => {
                    setFemaleGuestCount(n);
                    setSelectedMawkibId(null);
                  }}
                />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* mawkibs */}
          <section>
            <SectionHeader
              icon={<IconHome />}
              title="انتخاب موکب"
              subtitle="نمایش موکب‌ها بر اساس تعداد آقایان و خانم‌های انتخابی شما"
            />

            {mawkibsError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
                خطا در دریافت لیست موکب‌ها. لطفاً صفحه را رفرش کنید.
              </div>
            ) : mawkibsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c5d4e8] border-t-[#4a6fa5]" />
              </div>
            ) : !hasCapacity ? (
              <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <IconUsers />
                </div>
                <p className="font-medium text-amber-900">
                  متأسفانه چون ظرفیت خالی نداریم نمی‌توانیم در خدمتتان باشیم
                </p>
                <p className="mt-2 text-sm text-amber-700">
                  لطفاً تاریخ دیگری انتخاب کنید یا بعداً دوباره مراجعه فرمایید.
                </p>
                <p className="mt-2 text-xs text-amber-600">
                  ممکن است تاریخ انتخابی شما قبل از شروع خدمات برخی موکب‌ها باشد
                  یا از حداکثر بازه رزرو آن‌ها بیشتر باشد.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {mawkibs.map((mawkib) => (
                  <MawkibCard
                    key={mawkib.id}
                    mawkib={mawkib}
                    selected={selectedMawkibId === mawkib.id}
                    onSelect={() => setSelectedMawkibId(mawkib.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <hr className="border-slate-100" />

          <section>
            <SectionHeader
              icon={<IconUsers />}
              title="همراهان"
              subtitle="نام و اطلاعات همراهان خود را وارد کنید"
            />
            <textarea
              value={companions}
              onChange={(e) => setCompanions(e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="مثلاً نام، سن، نسبت و..."
            />
          </section>

          <hr className="border-slate-100" />

          {/* description */}
          <section>
            <SectionHeader
              icon={<IconChat />}
              title="توضیحات (اختیاری)"
              subtitle="اگر نکته‌ای برای مدیریت دارید بنویسید"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="مثلاً نیاز به دسترسی ویلچر، زمان تقریبی ورود و..."
            />
          </section>

          <button
            type="submit"
            disabled={
              submitting ||
              !hasCapacity ||
              mawkibsLoading ||
              maleGuestCount + femaleGuestCount < 1
            }
            className={`${guestTheme.btnPrimaryLg} py-3.5`}
          >
            {submitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                در حال ثبت...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                  />
                </svg>
                ثبت درخواست رزرو
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            درخواست شما پس از بررسی مدیریت تایید می‌شود
          </p>
        </form>
    </GuestShell>
  );
}
