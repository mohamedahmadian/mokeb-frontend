import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { authApi } from '../../lib/auth';
import {
  formatMobileForLookup,
  isCompleteIranMobile,
  normalizeMobileDigits,
  normalizeMobileInput,
} from '../../lib/mobile';
import { ProvinceCitySelect } from '../ui/ProvinceCitySelect';
import { NationalIdCardUpload } from '../ui/NationalIdCardUpload';
import { GenderSelect } from '../ui/GenderSelect';
import { CountrySelect } from '../ui/CountrySelect';
import { PersianDateInput } from '../ui/PersianDateInput';
import { reservationFormInputClass, todayDateString } from './reservation-form-ui';
import type { UserGender } from '../../types';

export type GuestMobileCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate';

function MobileAvailableIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function MobileCheckingIcon() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

interface GuestReservationPersonalFieldsProps {
  fullName: string;
  mobileNumber: string;
  nationalId: string;
  gender: UserGender | '';
  birthDate: string;
  country: string;
  passportNumber: string;
  password: string;
  province: string;
  city: string;
  nationalIdCardImageUrl: string | null;
  submitting: boolean;
  mode?: 'normal' | 'fast';
  onFullNameChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
  onNationalIdChange: (value: string) => void;
  onGenderChange: (value: UserGender | '') => void;
  onBirthDateChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPassportNumberChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onNationalIdCardImageUrlChange: (value: string | null) => void;
  onPasswordEnter: () => void;
}

export function GuestReservationPersonalFields({
  fullName,
  mobileNumber,
  nationalId,
  gender,
  birthDate,
  country,
  passportNumber,
  password,
  province,
  city,
  nationalIdCardImageUrl,
  submitting,
  mode = 'normal',
  onFullNameChange,
  onMobileNumberChange,
  onNationalIdChange,
  onGenderChange,
  onBirthDateChange,
  onCountryChange,
  onPassportNumberChange,
  onPasswordChange,
  onProvinceChange,
  onCityChange,
  onNationalIdCardImageUrlChange,
  onPasswordEnter,
}: GuestReservationPersonalFieldsProps) {
  const fullNameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const nationalIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const mobileCheckRequestId = useRef(0);
  const lastAutoAdvancedMobile = useRef('');
  const autoFilledFullNameRef = useRef<string | null>(null);
  const [mobileCheckStatus, setMobileCheckStatus] =
    useState<GuestMobileCheckStatus>('idle');
  const [existingUserFullName, setExistingUserFullName] = useState<string | null>(
    null,
  );

  const fullNameValueRef = useRef(fullName);
  fullNameValueRef.current = fullName;

  const focusField = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.focus();
  };

  const clearAutoFilledFullName = () => {
    if (
      autoFilledFullNameRef.current &&
      fullNameValueRef.current.trim() === autoFilledFullNameRef.current
    ) {
      onFullNameChange('');
    }
    autoFilledFullNameRef.current = null;
  };

  const applyExistingUserFullName = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    autoFilledFullNameRef.current = trimmedName;
    onFullNameChange(trimmedName);
  };

  useEffect(() => {
    const lookupMobile = formatMobileForLookup(mobileNumber);
    const digits = normalizeMobileDigits(lookupMobile);
    if (digits.length < 10) {
      setMobileCheckStatus('idle');
      setExistingUserFullName(null);
      clearAutoFilledFullName();
      return;
    }

    setMobileCheckStatus('checking');
    const requestId = ++mobileCheckRequestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const result = await authApi.isMobileRegistered(lookupMobile);
        if (requestId !== mobileCheckRequestId.current) return;
        if (result.registered) {
          const name = result.fullName?.trim() || null;
          setMobileCheckStatus('duplicate');
          setExistingUserFullName(name);
          if (name) {
            applyExistingUserFullName(name);
          }
        } else {
          setMobileCheckStatus('available');
          setExistingUserFullName(null);
          clearAutoFilledFullName();
        }
      } catch {
        if (requestId === mobileCheckRequestId.current) {
          setMobileCheckStatus('idle');
          setExistingUserFullName(null);
        }
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [mobileNumber, onFullNameChange]);

  useEffect(() => {
    if (!isCompleteIranMobile(mobileNumber)) {
      if (normalizeMobileDigits(mobileNumber).length < 10) {
        lastAutoAdvancedMobile.current = '';
      }
      return;
    }

    const lookupMobile = formatMobileForLookup(mobileNumber.trim());
    if (lastAutoAdvancedMobile.current === lookupMobile) return;

    lastAutoAdvancedMobile.current = lookupMobile;
    focusField(fullNameRef);
  }, [mobileNumber]);

  const isFastMode = mode === 'fast';
  const isDuplicateWithKnownName =
    mobileCheckStatus === 'duplicate' && Boolean(existingUserFullName);

  const handleEnter =
    (next: () => void) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      next();
    };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-600">شماره موبایل *</span>
          <div className="flex items-start gap-2">
            <input
              ref={mobileRef}
              type="tel"
              required
              value={mobileNumber}
              onChange={(e) => onMobileNumberChange(normalizeMobileInput(e.target.value))}
              onKeyDown={handleEnter(() => focusField(fullNameRef))}
              className={`${reservationFormInputClass} min-w-0 flex-1`}
              placeholder="09121234567"
              dir="ltr"
              inputMode="tel"
              autoComplete="tel"
            />
            {mobileCheckStatus === 'checking' && (
              <span
                className="mt-2.5 shrink-0"
                title="در حال بررسی شماره موبایل"
                aria-label="در حال بررسی شماره موبایل"
              >
                <MobileCheckingIcon />
              </span>
            )}
            {mobileCheckStatus === 'available' && (
              <span
                className="mt-2.5 shrink-0 text-green-500"
                title="شماره موبایل قابل ثبت است"
                aria-label="شماره موبایل قابل ثبت است"
              >
                <MobileAvailableIcon />
              </span>
            )}
          </div>
          {mobileCheckStatus === 'duplicate' && existingUserFullName && (
            <p className="mt-1.5 rounded-lg border border-amber-100 bg-amber-50/80 px-2.5 py-2 text-xs leading-relaxed text-amber-800">
              این شماره متعلق به{' '}
              <span className="font-semibold">{existingUserFullName}</span> می‌باشد
              و این رزرو برای ایشان ثبت خواهد شد.
            </p>
          )}
          {mobileCheckStatus === 'duplicate' && !existingUserFullName && (
            <p className="mt-1 text-xs text-amber-700">
              این شماره موبایل قبلاً در سیستم ثبت شده است؛ در صورت تأیید رزرو، همان
              حساب کاربری استفاده می‌شود.
            </p>
          )}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-600">
            نام و نام خانوادگی *
          </span>
          <input
            ref={fullNameRef}
            type="text"
            required
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            onKeyDown={handleEnter(() =>
              isFastMode ? onPasswordEnter() : focusField(nationalIdRef),
            )}
            readOnly={isDuplicateWithKnownName}
            className={`${reservationFormInputClass}${
              isDuplicateWithKnownName ? ' bg-slate-50 text-slate-700' : ''
            }`}
            placeholder="مثلاً علی محمدی"
          />
        </label>
      </div>

      {!isFastMode && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">کشور</span>
              <CountrySelect
                value={country}
                onChange={(value) => {
                  onCountryChange(value);
                  onProvinceChange('');
                  onCityChange('');
                }}
                inputClassName={reservationFormInputClass}
                placeholder="انتخاب کشور"
              />
            </label>
            <ProvinceCitySelect
              inline
              country={country}
              province={province}
              city={city}
              onProvinceChange={(value) => {
                onProvinceChange(value);
                onCityChange('');
              }}
              onCityChange={onCityChange}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">جنسیت</span>
              <GenderSelect
                value={gender}
                onChange={onGenderChange}
                disabled={submitting}
                variant="panel"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">تاریخ تولد</span>
              <PersianDateInput
                compact
                value={birthDate}
                onChange={onBirthDateChange}
                maxDate={todayDateString()}
                placeholder="انتخاب تاریخ"
                inputClassName={reservationFormInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">کد ملی</span>
              <input
                ref={nationalIdRef}
                type="text"
                inputMode="numeric"
                value={nationalId}
                onChange={(e) => onNationalIdChange(e.target.value)}
                onKeyDown={handleEnter(() => focusField(passwordRef))}
                className={reservationFormInputClass}
                placeholder="0123456789"
                dir="ltr"
                maxLength={10}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">رمز عبور</span>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyDown={handleEnter(onPasswordEnter)}
                className={reservationFormInputClass}
                minLength={4}
                autoComplete="new-password"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">شماره گذرنامه</span>
              <input
                type="text"
                value={passportNumber}
                onChange={(event) => onPassportNumberChange(event.target.value)}
                className={reservationFormInputClass}
                placeholder="شماره گذرنامه"
                dir="ltr"
              />
            </label>
          </div>

          <p className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
            در صورت عدم ورود رمز عبور، چهار رقم آخر شماره موبایل به‌عنوان رمز در نظر
            گرفته می‌شود.
          </p>

          <NationalIdCardUpload
            value={nationalIdCardImageUrl}
            onChange={onNationalIdCardImageUrlChange}
            disabled={submitting}
          />
        </>
      )}
    </div>
  );
}
