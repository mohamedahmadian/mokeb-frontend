import { useEffect, useMemo, useState } from 'react';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatPersianDateRange } from '../ui/PersianDateRangePicker';
import { NavIcon } from '../ui/NavIcons';
import { formatPersianNumber } from '../../lib/capacity';
import {
  buildReservationOccupiedDates,
  defaultReservationEndDate,
  effectiveDefaultReservationDays,
  effectiveMaxReservationDays,
  effectiveStayStartDate,
  isWithinMaxReservationDays,
  reservationStayDayCount,
  type StayDurationPreset,
} from '../../lib/date-range';
import { toast, toastApiError } from '../../lib/toast';
import { mawkibsApi } from '../../lib/mawkibs';
import { reservationsApi } from '../../lib/reservations';
import { usersApi } from '../../lib/users';
import { splitFullName } from '../../lib/full-name';
import { guestTheme } from '../../lib/guest-theme';
import { useAuth } from '../../contexts/AuthContext';
import type { UserGender } from '../../types';
import { MawkibThumbnail } from '../mawkibs/MawkibThumbnail';
import { btnPrimary, btnSecondary } from '../../lib/styles';
import {
  DEFAULT_CHECK_IN_TIME,
  DEFAULT_CHECK_OUT_TIME,
} from '../../lib/format-time';
import {
  GuestCountStepper,
  GuestCountCapacityBadge,
  IconCalendar,
  IconUser,
  SectionHeader,
  todayDateString,
} from './reservation-form-ui';
import {
  PanelNewPilgrimFields,
  PanelNewPilgrimOptionalFields,
  PANEL_OPTIONAL_FIELDS_COLLAPSE_LABEL,
} from './PanelNewPilgrimFields';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { MawkibCapacityPills } from '../mawkibs/MawkibInfoCard';
import { StayDurationPicker } from './StayDurationPicker';

interface QuickReservationFormProps {
  mawkibId: number;
  onSuccess: (reservationId: number) => void;
  onCancel?: () => void;
}

export function QuickReservationForm({
  mawkibId,
  onSuccess,
  onCancel,
}: QuickReservationFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isMawkibOwner = user?.roles.includes('MawkibOwner') ?? false;
  const canBypassCapacity = isAdmin || isMawkibOwner;
  const today = todayDateString();

  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [gender, setGender] = useState<UserGender | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [password, setPassword] = useState('');
  const [nationalIdCardImageUrl, setNationalIdCardImageUrl] = useState<string | null>(null);
  const [maleGuestCount, setMaleGuestCount] = useState(1);
  const [femaleGuestCount, setFemaleGuestCount] = useState(0);
  const [skipCapacityCheck, setSkipCapacityCheck] = useState(false);
  const [dateStart, setDateStart] = useState(today);
  const [dateEnd, setDateEnd] = useState(() => defaultReservationEndDate(today, 1));
  const [submitting, setSubmitting] = useState(false);

  const { data: mawkib, isLoading: mawkibLoading, isError: mawkibError } = useQuery({
    queryKey: ['mawkib', mawkibId],
    queryFn: () => mawkibsApi.getOne(mawkibId),
    enabled: mawkibId > 0,
  });

  const stayDays = reservationStayDayCount(dateStart, dateEnd);
  const dateRange = useMemo(
    () => buildReservationOccupiedDates(dateStart, dateEnd),
    [dateStart, dateEnd],
  );

  const capacityQueries = useQueries({
    queries: dateRange.map((date) => ({
      queryKey: ['mawkib-capacity', mawkibId, date],
      queryFn: () => reservationsApi.getCapacity(mawkibId, date),
      enabled: mawkibId > 0,
    })),
  });

  const capacityLoading = capacityQueries.some((query) => query.isLoading);
  const capacitySnapshots = capacityQueries
    .map((query) => query.data)
    .filter((snapshot) => snapshot != null);

  const showMaleFields = (mawkib?.maleCapacity ?? 0) > 0;
  const showFemaleFields = (mawkib?.femaleCapacity ?? 0) > 0;

  const maleMax =
    capacitySnapshots.length === dateRange.length
      ? Math.min(...capacitySnapshots.map((snapshot) => snapshot.availableMale))
      : undefined;
  const femaleMax =
    capacitySnapshots.length === dateRange.length
      ? Math.min(...capacitySnapshots.map((snapshot) => snapshot.availableFemale))
      : undefined;

  useEffect(() => {
    if (!mawkib) return;

    const start = effectiveStayStartDate(today, mawkib.serviceStartDate);
    setDateStart(start);
    setDateEnd(defaultReservationEndDate(start, mawkib.defaultReservationDays));

    const hasMale = mawkib.maleCapacity > 0;
    const hasFemale = mawkib.femaleCapacity > 0;
    setMaleGuestCount(hasMale ? 1 : 0);
    setFemaleGuestCount(hasMale ? 0 : hasFemale ? 1 : 0);
  }, [mawkib?.id, mawkib?.defaultReservationDays, mawkib?.serviceStartDate, mawkib?.maleCapacity, mawkib?.femaleCapacity, today]);

  useEffect(() => {
    if (!mawkib || !canBypassCapacity) return;
    setSkipCapacityCheck(mawkib.skipCapacityCheckEnabled === true);
  }, [mawkib?.id, mawkib?.skipCapacityCheckEnabled, canBypassCapacity]);

  const guestCountGridClass = useMemo(() => {
    if (showMaleFields && showFemaleFields) {
      return 'grid grid-cols-1 gap-4 sm:grid-cols-2';
    }
    return 'grid grid-cols-1 gap-4';
  }, [showMaleFields, showFemaleFields]);

  const rangeLabel = formatPersianDateRange(dateStart, dateEnd);

  const staySectionSubtitle = useMemo(
    () => rangeLabel,
    [rangeLabel],
  );

  const effectiveMaleGuestCount = showMaleFields ? maleGuestCount : 0;
  const effectiveFemaleGuestCount = showFemaleFields ? femaleGuestCount : 0;
  const totalGuestCount = effectiveMaleGuestCount + effectiveFemaleGuestCount;

  const reservationSectionSubtitle = useMemo(
    () =>
      `${formatPersianNumber(totalGuestCount)} مهمان برای بازه ${rangeLabel}`,
    [totalGuestCount, rangeLabel],
  );

  const bypassCapacityLimits = skipCapacityCheck && canBypassCapacity;

  const mawkibForCapacityDisplay = useMemo(() => {
    if (!mawkib) return mawkib;
    if (capacityLoading || capacitySnapshots.length !== dateRange.length) {
      return mawkib;
    }
    return {
      ...mawkib,
      availableMaleCapacity: maleMax ?? 0,
      availableFemaleCapacity: femaleMax ?? 0,
    };
  }, [
    mawkib,
    capacityLoading,
    capacitySnapshots.length,
    dateRange.length,
    maleMax,
    femaleMax,
  ]);

  const handleStayDurationSelect = (days: StayDurationPreset) => {
    const start = effectiveStayStartDate(today, mawkib?.serviceStartDate);
    setDateStart(start);
    setDateEnd(defaultReservationEndDate(start, days));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mawkib) {
      toast.error('موکب یافت نشد');
      return;
    }

    if (!fullName.trim()) {
      toast.error('نام و نام خانوادگی را وارد کنید');
      return;
    }
    if (!mobileNumber.trim()) {
      toast.error('شماره موبایل را وارد کنید');
      return;
    }

    const effectiveMale = effectiveMaleGuestCount;
    const effectiveFemale = effectiveFemaleGuestCount;

    if (effectiveMale + effectiveFemale < 1) {
      toast.error('حداقل یک نفر (آقا یا بانو) باید وارد شود');
      return;
    }

    const minReservationDays = effectiveDefaultReservationDays(mawkib.defaultReservationDays);
    const maxReservationDays = effectiveMaxReservationDays(mawkib.maxReservationDays);
    if (stayDays < minReservationDays) {
      toast.error(`حداقل بازه رزرو برای این موکب ${formatPersianNumber(minReservationDays)} روز است`);
      return;
    }
    if (!isWithinMaxReservationDays(dateStart, dateEnd, maxReservationDays)) {
      toast.error(`حداکثر بازه رزرو برای این موکب ${formatPersianNumber(maxReservationDays)} روز است`);
      return;
    }

    if (!bypassCapacityLimits) {
      if (showMaleFields && maleMax !== undefined && effectiveMale > maleMax) {
        toast.error(
          `ظرفیت آزاد آقایان برای بازه انتخاب‌شده ${formatPersianNumber(maleMax)} نفر است`,
        );
        return;
      }

      if (showFemaleFields && femaleMax !== undefined && effectiveFemale > femaleMax) {
        toast.error(
          `ظرفیت آزاد بانوان برای بازه انتخاب‌شده ${formatPersianNumber(femaleMax)} نفر است`,
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const { firstName, lastName } = splitFullName(fullName);

      const pilgrimUser = await usersApi.createQuickPilgrim({
        firstName,
        lastName,
        mobileNumber: mobileNumber.trim(),
        nationalId: nationalId.trim() || undefined,
        gender: gender || undefined,
        birthDate: birthDate || undefined,
        country: country.trim() || undefined,
        province: province.trim() || undefined,
        city: city.trim() || undefined,
        passportNumber: passportNumber.trim() || undefined,
        nationalIdCardImageUrl: nationalIdCardImageUrl ?? undefined,
        password: password.trim() || undefined,
      });

      const created = await reservationsApi.create({
        mawkibId,
        reservationDate: dateStart,
        reservationEndDate: dateEnd,
        maleGuestCount: effectiveMale,
        femaleGuestCount: effectiveFemale,
        pilgrimMobile: pilgrimUser.mobileNumber,
        pilgrimUserId: pilgrimUser.id,
        plannedCheckInTime: mawkib.defaultCheckInTime ?? DEFAULT_CHECK_IN_TIME,
        plannedCheckOutTime: mawkib.defaultCheckOutTime ?? DEFAULT_CHECK_OUT_TIME,
        skipCapacityCheck: skipCapacityCheck || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['reservations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['reservations-my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pilgrims'] });
      for (const date of dateRange) {
        queryClient.invalidateQueries({ queryKey: ['mawkib-capacity', mawkibId, date] });
      }

      toast.success('رزرو سریع با موفقیت ثبت شد');
      onSuccess(created.id);
    } catch (err) {
      toastApiError(err, 'خطا در ثبت رزرو سریع');
    } finally {
      setSubmitting(false);
    }
  };

  if (mawkibLoading) {
    return <p className="text-sm text-slate-500">در حال بارگذاری...</p>;
  }

  if (mawkibError || !mawkib) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
        موکب یافت نشد یا دسترسی ندارید.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`${guestTheme.cardLg} space-y-6`}>
      <div className="rounded-xl border border-[#c5d4e8] bg-[#f0f4fa]/60 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="relative shrink-0">
              <div
                className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#c5d4e8]/70 to-[#e8eef6]/30 blur-[2px]"
                aria-hidden
              />
              <MawkibThumbnail
                imageUrl={mawkib.imageUrl}
                name={mawkib.name}
                className="relative h-14 w-14 rounded-xl shadow-md shadow-slate-300/50 ring-2 ring-white sm:h-16 sm:w-16"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{mawkib.name}</p>
              <p className="mt-1 text-xs text-slate-500">
                رزرو سریع — بازه {formatPersianNumber(stayDays)} روزه
              </p>
              <p className="mt-1 text-sm font-medium text-[#4a6fa5]">{rangeLabel}</p>
            </div>
          </div>
          <MawkibCapacityPills
            mawkib={mawkibForCapacityDisplay ?? mawkib}
            compact
            stacked
            fitContent
          />
        </div>
      </div>

      <section>
        <SectionHeader
          icon={<IconUser />}
          title="اطلاعات زائر"
          subtitle="تلفن همراه و نام و نام خانوادگی"
        />
        <PanelNewPilgrimFields
          fullName={fullName}
          mobileNumber={mobileNumber}
          nationalId={nationalId}
          gender={gender}
          birthDate={birthDate}
          country={country}
          passportNumber={passportNumber}
          password={password}
          nationalIdCardImageUrl={nationalIdCardImageUrl}
          submitting={submitting}
          mobileLabel="تلفن همراه"
          showLocation={false}
          optionalFields="hidden"
          onFullNameChange={setFullName}
          onMobileNumberChange={setMobileNumber}
          onNationalIdChange={setNationalId}
          onGenderChange={setGender}
          onBirthDateChange={setBirthDate}
          onCountryChange={setCountry}
          onPassportNumberChange={setPassportNumber}
          onPasswordChange={setPassword}
          onNationalIdCardImageUrlChange={setNationalIdCardImageUrl}
        />
      </section>

      <hr className="border-slate-100" />

      <section>
        <SectionHeader
          icon={<IconCalendar />}
          title="مدت اقامت"
          subtitle={staySectionSubtitle}
        />
        <StayDurationPicker
          today={today}
          dateStart={dateStart}
          dateEnd={dateEnd}
          serviceStartDate={mawkib.serviceStartDate}
          defaultReservationDays={mawkib.defaultReservationDays}
          maxReservationDays={mawkib.maxReservationDays}
          mawkibSelected
          onSelect={handleStayDurationSelect}
        />
      </section>

      <hr className="border-slate-100" />

      {canBypassCapacity && (
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
          <input
            type="checkbox"
            checked={skipCapacityCheck}
            onChange={(e) => setSkipCapacityCheck(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm leading-relaxed text-amber-900">
            <span className="font-medium">ثبت بدون بررسی ظرفیت</span>
            <span className="mt-1 block text-xs text-amber-800">
              با انتخاب این گزینه، ظرفیت موکب بررسی نخواهد شد و مسئولیت بر عهده
              موکب‌دار محترم خواهد بود
            </span>
          </span>
        </label>
      )}

      <section>
        <SectionHeader
          icon={<IconCalendar />}
          title="اطلاعات رزرو"
          subtitle={reservationSectionSubtitle}
        />

        <div className={guestCountGridClass}>
          {showMaleFields && (
            <GuestCountStepper
              key={bypassCapacityLimits ? 'male-unlimited' : 'male-limited'}
              label="تعداد آقایان *"
              labelSuffix={
                !capacityLoading && maleMax !== undefined ? (
                  <GuestCountCapacityBadge available={maleMax} variant="male" />
                ) : undefined
              }
              value={maleGuestCount}
              max={bypassCapacityLimits ? undefined : maleMax}
              onChange={setMaleGuestCount}
            />
          )}
          {showFemaleFields && (
            <GuestCountStepper
              key={bypassCapacityLimits ? 'female-unlimited' : 'female-limited'}
              label="تعداد بانوان *"
              labelSuffix={
                !capacityLoading && femaleMax !== undefined ? (
                  <GuestCountCapacityBadge available={femaleMax} variant="female" />
                ) : undefined
              }
              value={femaleGuestCount}
              min={showMaleFields ? 0 : 1}
              max={bypassCapacityLimits ? undefined : femaleMax}
              onChange={setFemaleGuestCount}
            />
          )}
        </div>
      </section>

      <hr className="border-slate-100" />

      <section>
        <CollapsibleSection
          variant="card"
          summary={PANEL_OPTIONAL_FIELDS_COLLAPSE_LABEL}
          summaryIcon={<IconUser />}
        >
          <PanelNewPilgrimOptionalFields
            nationalId={nationalId}
            gender={gender}
            birthDate={birthDate}
            country={country}
            passportNumber={passportNumber}
            password={password}
            nationalIdCardImageUrl={nationalIdCardImageUrl}
            submitting={submitting}
            province={province}
            city={city}
            onNationalIdChange={setNationalId}
            onGenderChange={setGender}
            onBirthDateChange={setBirthDate}
            onCountryChange={setCountry}
            onPassportNumberChange={setPassportNumber}
            onPasswordChange={setPassword}
            onNationalIdCardImageUrlChange={setNationalIdCardImageUrl}
            onProvinceChange={setProvince}
            onCityChange={setCity}
          />
        </CollapsibleSection>
      </section>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className={`${btnSecondary} w-full sm:w-auto`}
          >
            انصراف
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className={`${btnPrimary} inline-flex w-full items-center justify-center gap-2 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <NavIcon name="todayReserve" className="h-4 w-4 shrink-0" />
          {submitting ? 'در حال ثبت...' : 'ثبت رزرو سریع'}
        </button>
      </div>
    </form>
  );
}

/** @deprecated Use QuickReservationForm */
export const TodayReservationForm = QuickReservationForm;
