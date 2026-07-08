import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PersianDateInput } from '../ui/PersianDateInput';
import { formatPersianDateRange } from '../ui/PersianDateRangePicker';
import { guestTheme } from '../../lib/guest-theme';
import { guestApi } from '../../lib/guest';
import { mawkibsApi } from '../../lib/mawkibs';
import { splitFullName } from '../../lib/full-name';
import { genderFromGuestCounts } from '../../lib/user-gender';
import { buildReservationFromGuestSuccess } from '../../lib/guest-success-reservation';
import {
  defaultReservationEndDate,
  effectiveDefaultReservationDays,
  effectiveMaxReservationDays,
  effectiveStayStartDate,
  reservationStayDayCount,
} from '../../lib/date-range';
import { toast, toastApiError } from '../../lib/toast';
import type { Mawkib, Reservation } from '../../types';
import { PilgrimCardModal } from '../reservations/PilgrimCardModal';
import {
  GuestCountQuickPick,
  GuestCountStepper,
  IconCalendar,
  IconPhone,
  IconUser,
  MawkibCard,
  SectionHeader,
  StayDateAlignAlert,
  StayDurationQuickPick,
  reservationFormInputClass,
  todayDateString,
} from '../reservations/reservation-form-ui';

const WIZARD_STEPS = [
  { id: 1, label: 'اطلاعات زائر' },
  { id: 2, label: 'تاریخ و تعداد' },
  { id: 3, label: 'انتخاب موکب' },
] as const;

function mawkibMatchesNameQuery(name: string, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;
  return name.includes(trimmed);
}

function WizardStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-6 w-full">
      <div className="flex w-full items-start">
        {WIZARD_STEPS.map((step, index) => {
          const active = currentStep === step.id;
          const completed = currentStep > step.id;
          const isLast = index === WIZARD_STEPS.length - 1;

          return (
            <div
              key={step.id}
              className={`flex items-start ${isLast ? 'shrink-0' : 'min-w-0 flex-1'}`}
            >
              <div className="flex shrink-0 flex-col items-center gap-1.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    active
                      ? 'bg-[#4a6fa5] text-white shadow-md ring-4 ring-[#4a6fa5]/15'
                      : completed
                        ? 'bg-[#e8eef6] text-[#4a6fa5] ring-2 ring-[#c5d4e8]'
                        : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'
                  }`}
                >
                  {completed ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={`max-w-[5.5rem] truncate text-center text-[11px] font-medium sm:max-w-none sm:text-xs ${
                    active ? 'text-[#4a6fa5]' : completed ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mt-[1.125rem] h-0.5 min-w-[1rem] flex-1 rounded-full transition-colors ${
                    currentStep > step.id ? 'bg-[#4a6fa5]/50' : 'bg-slate-200'
                  }`}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const wizardBtnBase =
  'inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
const wizardBtnSecondary = `${wizardBtnBase} border border-slate-200/90 bg-white text-slate-700 shadow-sm hover:border-[#c5d4e8] hover:bg-[#f0f4fa]`;
const wizardBtnPrimary = `${wizardBtnBase} bg-[#4a6fa5] text-white shadow-sm hover:bg-[#3d5d8a]`;

function IconWizardBack() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function IconWizardNext() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function IconWizardSubmit() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function HomeQuickReserveWizard() {
  const today = todayDateString();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [maleGuestCount, setMaleGuestCount] = useState(1);
  const [femaleGuestCount, setFemaleGuestCount] = useState(0);
  const [dateStart, setDateStart] = useState(today);
  const [dateEnd, setDateEnd] = useState(() => defaultReservationEndDate(today, 1));
  const [stayDateAlignAlert, setStayDateAlignAlert] = useState<string | null>(null);
  const [selectedMawkibId, setSelectedMawkibId] = useState<number | null>(null);
  const [mawkibSearchQuery, setMawkibSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pilgrimCardOpen, setPilgrimCardOpen] = useState(false);
  const [completedReservation, setCompletedReservation] = useState<Reservation | null>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);

  const resetWizard = () => {
    const freshToday = todayDateString();
    setStep(1);
    setFullName('');
    setMobileNumber('');
    setMaleGuestCount(1);
    setFemaleGuestCount(0);
    setDateStart(freshToday);
    setDateEnd(defaultReservationEndDate(freshToday, 1));
    setStayDateAlignAlert(null);
    setSelectedMawkibId(null);
    setMawkibSearchQuery('');
  };

  const minReservationDays = effectiveDefaultReservationDays(undefined);
  const maxReservationDays = effectiveMaxReservationDays(undefined);
  const effectiveStart = useMemo(() => effectiveStayStartDate(today), [today]);
  const stayDays = reservationStayDayCount(dateStart, dateEnd);
  const minimumEndDate = useMemo(
    () => (dateStart ? defaultReservationEndDate(dateStart, minReservationDays) : today),
    [dateStart, minReservationDays, today],
  );

  const {
    data: mawkibs = [],
    isLoading: mawkibsLoading,
    isError: mawkibsError,
  } = useQuery({
    queryKey: [
      'home-wizard-mawkibs',
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
    enabled:
      step === 3 &&
      !!dateStart &&
      !!dateEnd &&
      maleGuestCount + femaleGuestCount >= 1,
  });

  const filteredMawkibs = useMemo(() => {
    if (!mawkibSearchQuery.trim()) return mawkibs;
    return mawkibs.filter((m) => mawkibMatchesNameQuery(m.name, mawkibSearchQuery));
  }, [mawkibs, mawkibSearchQuery]);

  const selectedMawkib = useMemo(
    () => mawkibs.find((m) => m.id === selectedMawkibId) ?? null,
    [mawkibs, selectedMawkibId],
  );

  const handleQuickPickMale = () => {
    setFemaleGuestCount(0);
    setMaleGuestCount((current) => current + 1);
  };

  const handleQuickPickFemale = () => {
    setMaleGuestCount(0);
    setFemaleGuestCount((current) => current + 1);
  };

  const maleQuickPickActive = maleGuestCount > 0 && femaleGuestCount === 0;
  const femaleQuickPickActive = femaleGuestCount > 0 && maleGuestCount === 0;

  const handleStayDurationPick = (days: number) => {
    setStayDateAlignAlert(null);
    setDateStart(effectiveStart);
    setDateEnd(defaultReservationEndDate(effectiveStart, days));
    setSelectedMawkibId(null);
  };

  const isStayDurationActive = (days: number) =>
    dateStart === effectiveStart && stayDays === days;

  const isStayDurationDisabled = (days: number) =>
    days < minReservationDays || days > maxReservationDays;

  const handleDateStartChange = (start: string) => {
    setStayDateAlignAlert(null);
    setDateStart(start);
    if (start) {
      const minEnd = defaultReservationEndDate(start, minReservationDays);
      if (!dateEnd || dateEnd < minEnd) setDateEnd(minEnd);
    }
    setSelectedMawkibId(null);
  };

  const handleDateEndChange = (end: string) => {
    setStayDateAlignAlert(null);
    if (!end || !dateStart) {
      setDateEnd(end);
      return;
    }
    const minEnd = defaultReservationEndDate(dateStart, minReservationDays);
    if (end < minEnd) {
      toast.error(
        end < dateStart
          ? 'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد'
          : `حداقل مدت اقامت ${minReservationDays} روز است`,
      );
      setDateEnd(minEnd);
      return;
    }
    setDateEnd(end);
    setSelectedMawkibId(null);
  };

  const validateStep1 = () => {
    if (!fullName.trim()) {
      toast.error('نام و نام خانوادگی را وارد کنید');
      return false;
    }
    if (!mobileNumber.trim()) {
      toast.error('شماره موبایل را وارد کنید');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (maleGuestCount + femaleGuestCount < 1) {
      toast.error('حداقل یک نفر (آقا یا بانو) باید وارد شود');
      return false;
    }
    if (!dateStart || !dateEnd) {
      toast.error('تاریخ اقامت را انتخاب کنید');
      return false;
    }
    if (stayDays < minReservationDays) {
      toast.error(`حداقل مدت اقامت ${minReservationDays} روز است`);
      return false;
    }
    if (stayDays > maxReservationDays) {
      toast.error(`حداکثر مدت اقامت ${maxReservationDays} روز است`);
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((current) => Math.min(current + 1, 3));
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSelectMawkib = (mawkib: Mawkib) => {
    setSelectedMawkibId(mawkib.id);
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;
    if (!selectedMawkibId) {
      toast.error('لطفاً یک موکب انتخاب کنید');
      return;
    }

    setSubmitting(true);
    try {
      const trimmedMobile = mobileNumber.trim();
      const { firstName, lastName } = splitFullName(fullName);
      const gender = genderFromGuestCounts(maleGuestCount, femaleGuestCount);

      const result = await guestApi.createReservation({
        firstName,
        lastName,
        mobileNumber: trimmedMobile,
        mawkibId: selectedMawkibId,
        reservationDate: dateStart,
        reservationEndDate: dateEnd,
        maleGuestCount,
        femaleGuestCount,
        gender: gender || undefined,
      });

      const reservation = buildReservationFromGuestSuccess({
        variant: 'guest',
        message: result.message,
        mawkibName: result.mawkibName,
        reservationDate: result.reservationDate,
        reservationEndDate: result.reservationEndDate,
        maleGuestCount: result.maleGuestCount,
        femaleGuestCount: result.femaleGuestCount,
        trackingCode: result.trackingCode,
        mobileNumber: trimmedMobile,
        loginPasswordHint: trimmedMobile.replace(/\D/g, '').slice(-4),
        fullName: fullName.trim(),
        mawkibId: selectedMawkibId,
        reservationId: result.reservationId,
        guestReservationMode: 'fast',
        mawkibSnapshot: selectedMawkib
          ? {
              id: selectedMawkib.id,
              name: selectedMawkib.name,
              address: selectedMawkib.address,
              phoneNumber: selectedMawkib.phoneNumber,
              imageUrl: selectedMawkib.imageUrl,
              owner: selectedMawkib.owner
                ? {
                    fullName: selectedMawkib.owner.fullName,
                    mobileNumber: selectedMawkib.owner.mobileNumber,
                  }
                : undefined,
            }
          : undefined,
      });

      setCompletedReservation(reservation);
      resetWizard();
      setPilgrimCardOpen(true);
      toast.success('رزرو با موفقیت ثبت شد');
    } catch (err) {
      toastApiError(err, 'خطا در ثبت رزرو. لطفاً دوباره تلاش کنید');
    } finally {
      setSubmitting(false);
    }
  };

  const staySubtitle = formatPersianDateRange(dateStart, dateEnd);

  return (
    <>
      <div className="relative rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-[#4a6fa5]/5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden rounded-t-3xl bg-gradient-to-b from-[#f0f4fa] to-transparent"
          aria-hidden
        />

        <div className="relative p-5 sm:p-7">
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
              <IconUser />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-800 sm:text-xl">رزرو سریع موکب</h2>
              <p className="text-xs text-slate-500 sm:text-sm">
                {step === 1 && 'اطلاعات تماس و هویت زائر'}
                {step === 2 && 'تعداد نفرات و بازه اقامت'}
                {step === 3 && 'موکب مناسب را انتخاب کنید'}
              </p>
            </div>
          </div>

          <WizardStepIndicator currentStep={step} />

          {step === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                  <IconUser className="h-4 w-4 text-[#4a6fa5]" />
                  نام و نام خانوادگی *
                </span>
                <input
                  ref={fullNameRef}
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    mobileRef.current?.focus();
                  }}
                  className={guestTheme.input}
                  placeholder="نام کامل زائر"
                  autoComplete="name"
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                  <IconPhone className="h-4 w-4 text-[#4a6fa5]" />
                  تلفن همراه *
                </span>
                <input
                  ref={mobileRef}
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    goNext();
                  }}
                  className={guestTheme.input}
                  placeholder="مثال: 09123456789"
                  dir="ltr"
                  autoComplete="tel"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-4">
                <SectionHeader
                  icon={<IconUser />}
                  title="تعداد زائران"
                />
                <GuestCountQuickPick
                  onPickMale={handleQuickPickMale}
                  onPickFemale={handleQuickPickFemale}
                  maleActive={maleQuickPickActive}
                  femaleActive={femaleQuickPickActive}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <GuestCountStepper
                    label="تعداد آقایان *"
                    value={maleGuestCount}
                    onChange={setMaleGuestCount}
                    compact
                  />
                  <GuestCountStepper
                    label="تعداد بانوان *"
                    value={femaleGuestCount}
                    min={0}
                    onChange={setFemaleGuestCount}
                    compact
                  />
                </div>
              </div>

              <div className="overflow-visible rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white p-4">
                <SectionHeader
                  icon={<IconCalendar />}
                  title="تاریخ اقامت"
                  subtitle={staySubtitle}
                />
                <StayDateAlignAlert message={stayDateAlignAlert} />
                <StayDurationQuickPick
                  onSelect={handleStayDurationPick}
                  isActive={isStayDurationActive}
                  isDisabled={isStayDurationDisabled}
                />
                <div className="grid grid-cols-1 gap-4 overflow-visible sm:grid-cols-2">
                  <PersianDateInput
                    label="تاریخ شروع اقامت *"
                    value={dateStart}
                    onChange={handleDateStartChange}
                    placeholder="انتخاب تاریخ ورود"
                    minDate={effectiveStart}
                    inputClassName={reservationFormInputClass}
                    clearable={false}
                    portal
                  />
                  <PersianDateInput
                    label="تاریخ پایان اقامت *"
                    value={dateEnd}
                    onChange={handleDateEndChange}
                    placeholder="انتخاب تاریخ خروج"
                    minDate={minimumEndDate}
                    inputClassName={reservationFormInputClass}
                    clearable={false}
                    portal
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#c5d4e8]/60 bg-[#f0f4fa]/50 px-4 py-3 text-sm text-slate-600">
                <span className="font-medium text-slate-800">{fullName.trim()}</span>
                {' · '}
                <span dir="ltr">{mobileNumber.trim()}</span>
                {' · '}
                {staySubtitle}
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm text-slate-600">جستجو بر اساس نام موکب</span>
                <input
                  type="search"
                  value={mawkibSearchQuery}
                  onChange={(e) => setMawkibSearchQuery(e.target.value)}
                  placeholder="بخشی از نام موکب را وارد کنید..."
                  className={guestTheme.input}
                  autoComplete="off"
                />
              </label>

              {mawkibsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#c5d4e8] border-t-[#4a6fa5]" />
                </div>
              ) : mawkibsError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
                  خطا در دریافت لیست موکب‌ها. لطفاً دوباره تلاش کنید.
                </div>
              ) : filteredMawkibs.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">
                  {mawkibSearchQuery.trim()
                    ? `موکبی با نام «${mawkibSearchQuery.trim()}» یافت نشد.`
                    : 'موکبی با ظرفیت مناسب در این بازه یافت نشد. تاریخ یا تعداد نفرات را تغییر دهید.'}
                </div>
              ) : (
                <div className="max-h-[min(24rem,50vh)] space-y-3 overflow-y-auto pe-1">
                  {filteredMawkibs.map((mawkib) => (
                    <MawkibCard
                      key={mawkib.id}
                      mawkib={mawkib}
                      selected={selectedMawkibId === mawkib.id}
                      onSelect={() => handleSelectMawkib(mawkib)}
                      showThumbnail
                      variant="guest-browse"
                      showLocationQr={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={submitting}
                className={`${wizardBtnSecondary} w-full sm:w-auto`}
              >
                <IconWizardBack />
                مرحله قبل
              </button>
            ) : (
              <span className="hidden sm:block" aria-hidden />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className={`${wizardBtnPrimary} w-full sm:ms-auto sm:w-auto`}
              >
                مرحله بعد
                <IconWizardNext />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !selectedMawkibId}
                className={`${wizardBtnPrimary} w-full sm:ms-auto sm:w-auto`}
              >
                {submitting ? 'در حال ثبت...' : 'ثبت نهایی'}
                {!submitting && <IconWizardSubmit />}
              </button>
            )}
          </div>
        </div>
      </div>

      <PilgrimCardModal
        open={pilgrimCardOpen}
        onClose={() => setPilgrimCardOpen(false)}
        reservation={completedReservation}
        notice="کاربر گرامی، رزرو شما در لیست انتظار موکب‌دار محترم قرار گرفته و به زودی بررسی خواهد شد."
      />
    </>
  );
}
