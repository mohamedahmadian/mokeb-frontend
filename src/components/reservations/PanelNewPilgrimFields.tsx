import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { authApi } from "../../lib/auth";
import { formatMobileForLookup, normalizeMobileDigits } from "../../lib/mobile";
import {
  getMobileValidationError,
  getNationalIdValidationError,
} from "../../lib/pilgrim-field-validation";
import { CollapsibleSection } from "../ui/CollapsibleSection";
import { ProvinceCitySelect } from "../ui/ProvinceCitySelect";
import { NationalIdCardUpload } from "../ui/NationalIdCardUpload";
import { GenderSelect } from "../ui/GenderSelect";
import { CountrySelect } from "../ui/CountrySelect";
import { PersianDateInput } from "../ui/PersianDateInput";
import {
  reservationFormInputClass,
  FieldValidationErrorIcon,
  todayDateString,
} from "./reservation-form-ui";
import type { UserGender } from "../../types";

export type PanelMobileCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "duplicate";

export const PANEL_OPTIONAL_FIELDS_COLLAPSE_LABEL =
  "اطلاعات تکمیلی ( اختیاری )";

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

function FieldValidationAdornment({
  error,
  children,
}: {
  error: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">{children}</div>
      {error ? (
        <span
          className="mt-2.5 shrink-0"
          title={error}
          aria-label={error}
          role="img"
        >
          <FieldValidationErrorIcon title={error} />
        </span>
      ) : null}
    </div>
  );
}

export interface PanelNewPilgrimOptionalFieldsProps {
  nationalId: string;
  carPlate: string;
  gender: UserGender | "";
  birthDate: string;
  travelOrigin?: string;
  country: string;
  passportNumber: string;
  nationalIdCardImageUrl: string | null;
  submitting: boolean;
  password?: string;
  showLocation?: boolean;
  province?: string;
  city?: string;
  onNationalIdChange: (value: string) => void;
  onCarPlateChange: (value: string) => void;
  onGenderChange: (value: UserGender | "") => void;
  onBirthDateChange: (value: string) => void;
  onTravelOriginChange?: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPassportNumberChange: (value: string) => void;
  onNationalIdCardImageUrlChange: (value: string | null) => void;
  onPasswordChange?: (value: string) => void;
  onProvinceChange?: (value: string) => void;
  onCityChange?: (value: string) => void;
  nationalIdInputRef?: React.RefObject<HTMLInputElement | null>;
  hideNationalId?: boolean;
  showBlurValidation?: boolean;
  nationalIdTouched?: boolean;
  onNationalIdBlur?: () => void;
}

export function PanelNewPilgrimOptionalFields({
  nationalId,
  carPlate,
  gender,
  birthDate,
  travelOrigin = "",
  country,
  passportNumber,
  nationalIdCardImageUrl,
  submitting,
  showLocation = true,
  province = "",
  city = "",
  onNationalIdChange,
  onCarPlateChange,
  onGenderChange,
  onBirthDateChange,
  onTravelOriginChange: _onTravelOriginChange,
  onCountryChange,
  onPassportNumberChange,
  onNationalIdCardImageUrlChange,
  onPasswordChange,
  onProvinceChange,
  onCityChange,
  nationalIdInputRef,
  hideNationalId = false,
  showBlurValidation = false,
  nationalIdTouched: nationalIdTouchedProp = false,
  onNationalIdBlur,
  password = "",
}: PanelNewPilgrimOptionalFieldsProps) {
  const localNationalIdRef = useRef<HTMLInputElement>(null);
  const nationalIdRef = nationalIdInputRef ?? localNationalIdRef;
  const [localNationalIdTouched, setLocalNationalIdTouched] = useState(false);
  const nationalIdTouched = nationalIdTouchedProp || localNationalIdTouched;
  const nationalIdError =
    showBlurValidation && nationalIdTouched
      ? getNationalIdValidationError(nationalId)
      : null;
  const handleNationalIdBlur = () => {
    if (showBlurValidation) setLocalNationalIdTouched(true);
    onNationalIdBlur?.();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {onPasswordChange ? (
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-600">
              رمز عبور
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={reservationFormInputClass}
              minLength={4}
              autoComplete="new-password"
              placeholder="حداقل ۴ کاراکتر"
            />
          </label>
        ) : null}
        {!hideNationalId ? (
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-600">کد ملی</span>
            <FieldValidationAdornment error={nationalIdError}>
              <input
                ref={nationalIdRef}
                type="text"
                inputMode="numeric"
                value={nationalId}
                onChange={(e) => onNationalIdChange(e.target.value)}
                onBlur={handleNationalIdBlur}
                className={reservationFormInputClass}
                placeholder="0123456789"
                dir="ltr"
                maxLength={10}
              />
            </FieldValidationAdornment>
          </label>
        ) : null}
        {!hideNationalId ? (
          <label className="block sm:col-span-3">
            <span className="mb-1.5 block text-sm text-slate-600">
              پلاک ماشین
            </span>
            <input
              type="text"
              value={carPlate}
              onChange={(e) => onCarPlateChange(e.target.value)}
              className={`${reservationFormInputClass} max-w-xs`}
              placeholder="اختیاری — مثلاً 12ب345-67"
              dir="ltr"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-600">
            شماره گذرنامه
          </span>
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
          <span className="mb-1.5 block text-sm text-slate-600">
            تاریخ تولد
          </span>
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
          <span className="mb-1.5 block text-sm text-slate-600">مبدا سفر</span>
          <input
            type="text"
            value={travelOrigin}
            readOnly
            tabIndex={-1}
            className={`${reservationFormInputClass} cursor-not-allowed bg-slate-50 text-slate-700`}
            placeholder="—"
          />
        </label>
      </div>

      {showLocation && onProvinceChange && onCityChange ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-600">کشور</span>
            <CountrySelect
              value={country}
              onChange={(value) => {
                onCountryChange(value);
                onProvinceChange("");
                onCityChange("");
              }}
              inputClassName={reservationFormInputClass}
            />
          </label>
          <ProvinceCitySelect
            inline
            country={country}
            province={province}
            city={city}
            onProvinceChange={(value) => {
              onProvinceChange(value);
              onCityChange("");
            }}
            onCityChange={onCityChange}
          />
        </div>
      ) : (
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-600">کشور</span>
          <CountrySelect
            value={country}
            onChange={(value) => {
              onCountryChange(value);
              onProvinceChange?.("");
              onCityChange?.("");
            }}
            inputClassName={reservationFormInputClass}
          />
        </label>
      )}

      <NationalIdCardUpload
        value={nationalIdCardImageUrl}
        onChange={onNationalIdCardImageUrlChange}
        disabled={submitting}
      />
    </div>
  );
}

interface PanelNewPilgrimFieldsProps extends PanelNewPilgrimOptionalFieldsProps {
  fullName: string;
  mobileNumber: string;
  onFullNameChange: (value: string) => void;
  onMobileNumberChange: (value: string) => void;
  mobileLabel?: string;
  /** Focus mobile input when the form mounts (e.g. quick reservation). */
  autoFocusMobile?: boolean;
  /** Increment to request focus on the mobile field (e.g. after closing success modal). */
  mobileFocusTrigger?: number;
  /** inline: همه فیلدها باز | collapsible: بقیه در باکس بازشونده | hidden: فقط موبایل و نام */
  optionalFields?: "inline" | "collapsible" | "hidden";
  showCustomTrackingCode?: boolean;
  trackingCode?: string;
  onTrackingCodeChange?: (value: string) => void;
  onTrackingCodeEnter?: () => void;
  showBlurValidation?: boolean;
}

export function PanelNewPilgrimFields({
  fullName,
  mobileNumber,
  nationalId,
  carPlate,
  gender,
  birthDate,
  travelOrigin = "",
  country,
  passportNumber,
  nationalIdCardImageUrl,
  submitting,
  onFullNameChange,
  onMobileNumberChange,
  onNationalIdChange,
  onCarPlateChange,
  onGenderChange,
  onBirthDateChange,
  onTravelOriginChange,
  onCountryChange,
  onPassportNumberChange,
  onNationalIdCardImageUrlChange,
  mobileLabel = "شماره موبایل",
  autoFocusMobile = false,
  mobileFocusTrigger = 0,
  showLocation = true,
  optionalFields = "inline",
  province = "",
  city = "",
  onProvinceChange,
  onCityChange,
  password = "",
  onPasswordChange,
  showCustomTrackingCode = false,
  trackingCode = "",
  onTrackingCodeChange,
  onTrackingCodeEnter,
  showBlurValidation = false,
}: PanelNewPilgrimFieldsProps) {
  const mobileRef = useRef<HTMLInputElement>(null);
  const fullNameRef = useRef<HTMLInputElement>(null);
  const nationalIdRef = useRef<HTMLInputElement>(null);
  const trackingCodeRef = useRef<HTMLInputElement>(null);
  const mobileCheckRequestId = useRef(0);
  const autoFilledFullNameRef = useRef<string | null>(null);
  const fullNameValueRef = useRef(fullName);
  fullNameValueRef.current = fullName;
  const [mobileTouched, setMobileTouched] = useState(false);
  const [nationalIdTouched, setNationalIdTouched] = useState(false);
  const [mobileCheckStatus, setMobileCheckStatus] =
    useState<PanelMobileCheckStatus>("idle");
  const [existingUserFullName, setExistingUserFullName] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!autoFocusMobile) return;
    const frameId = requestAnimationFrame(() => {
      mobileRef.current?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [autoFocusMobile]);

  useEffect(() => {
    if (mobileFocusTrigger <= 0) return;
    const frameId = requestAnimationFrame(() => {
      mobileRef.current?.focus();
    });
    return () => cancelAnimationFrame(frameId);
  }, [mobileFocusTrigger]);

  const clearAutoFilledFullName = () => {
    if (
      autoFilledFullNameRef.current &&
      fullNameValueRef.current.trim() === autoFilledFullNameRef.current
    ) {
      onFullNameChange("");
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
      setMobileCheckStatus("idle");
      setExistingUserFullName(null);
      clearAutoFilledFullName();
      return;
    }

    setMobileCheckStatus("checking");
    const requestId = ++mobileCheckRequestId.current;
    const timer = window.setTimeout(async () => {
      try {
        const result = await authApi.isMobileRegistered(lookupMobile);
        if (requestId !== mobileCheckRequestId.current) return;
        if (result.registered) {
          const name = result.fullName?.trim() || null;
          setMobileCheckStatus("duplicate");
          setExistingUserFullName(name);
          if (name) {
            applyExistingUserFullName(name);
          }
        } else {
          setMobileCheckStatus("available");
          setExistingUserFullName(null);
          clearAutoFilledFullName();
        }
      } catch {
        if (requestId === mobileCheckRequestId.current) {
          setMobileCheckStatus("idle");
          setExistingUserFullName(null);
        }
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [mobileNumber, onFullNameChange]);

  const focusField = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.focus();
  };

  const handleEnter =
    (next: () => void) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      next();
    };

  const isDuplicateWithKnownName =
    mobileCheckStatus === "duplicate" && Boolean(existingUserFullName);

  const useOwnerEntryLayout = showCustomTrackingCode && !!onTrackingCodeChange;

  const mobileValidationError =
    showBlurValidation && mobileTouched
      ? getMobileValidationError(mobileNumber)
      : null;
  const ownerNationalIdError =
    showBlurValidation && nationalIdTouched
      ? getNationalIdValidationError(nationalId)
      : null;

  const optionalFieldValidationProps = {
    showBlurValidation,
    nationalIdTouched,
    onNationalIdBlur: showBlurValidation
      ? () => setNationalIdTouched(true)
      : undefined,
  };

  const optionalFieldsContent = (
    <PanelNewPilgrimOptionalFields
      nationalId={nationalId}
      carPlate={carPlate}
      gender={gender}
      birthDate={birthDate}
      travelOrigin={travelOrigin}
      country={country}
      passportNumber={passportNumber}
      nationalIdCardImageUrl={nationalIdCardImageUrl}
      submitting={submitting}
      showLocation={showLocation}
      province={province}
      city={city}
      onNationalIdChange={onNationalIdChange}
      onCarPlateChange={onCarPlateChange}
      onGenderChange={onGenderChange}
      onBirthDateChange={onBirthDateChange}
      onTravelOriginChange={onTravelOriginChange}
      onCountryChange={onCountryChange}
      onPassportNumberChange={onPassportNumberChange}
      onNationalIdCardImageUrlChange={onNationalIdCardImageUrlChange}
      onProvinceChange={onProvinceChange}
      onCityChange={onCityChange}
      nationalIdInputRef={nationalIdRef}
      hideNationalId={useOwnerEntryLayout}
      password={password}
      onPasswordChange={onPasswordChange}
      {...optionalFieldValidationProps}
    />
  );

  const mobileField = (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-600">
        {mobileLabel} *
      </span>
      <div className="flex items-start gap-2">
        <input
          ref={mobileRef}
          type="tel"
          required
          value={mobileNumber}
          onChange={(e) => onMobileNumberChange(e.target.value)}
          onBlur={() => {
            if (showBlurValidation) setMobileTouched(true);
          }}
          onKeyDown={handleEnter(() => focusField(fullNameRef))}
          className={`${reservationFormInputClass} min-w-0 flex-1`}
          placeholder="09121234567"
          dir="ltr"
        />
        {mobileValidationError ? (
          <span
            className="mt-2.5 shrink-0"
            title={mobileValidationError}
            aria-label={mobileValidationError}
            role="img"
          >
            <FieldValidationErrorIcon title={mobileValidationError} />
          </span>
        ) : mobileCheckStatus === "available" ? (
          <span
            className="mt-2.5 shrink-0 text-green-500"
            title="شماره موبایل قابل ثبت است"
            aria-label="شماره موبایل قابل ثبت است"
          >
            <MobileAvailableIcon />
          </span>
        ) : null}
      </div>
      {mobileCheckStatus === "duplicate" && existingUserFullName && (
        <p className="mt-1.5 rounded-lg border border-amber-100 bg-amber-50/80 px-2.5 py-2 text-xs leading-relaxed text-amber-800">
          این شماره متعلق به{" "}
          <span className="font-semibold">{existingUserFullName}</span> می‌باشد
          و این رزرو برای ایشان ثبت خواهد شد.
        </p>
      )}
      {mobileCheckStatus === "duplicate" && !existingUserFullName && (
        <p className="mt-1.5 text-xs text-amber-700">
          این شماره موبایل قبلاً در سیستم ثبت شده است؛ رزرو برای همان حساب
          کاربری ثبت می‌شود.
        </p>
      )}
    </label>
  );

  if (useOwnerEntryLayout) {
    return (
      <div className="space-y-3">
        {mobileField}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              onKeyDown={handleEnter(() => focusField(nationalIdRef))}
              readOnly={isDuplicateWithKnownName}
              className={`${reservationFormInputClass}${
                isDuplicateWithKnownName ? " bg-slate-50 text-slate-700" : ""
              }`}
              placeholder="مثلاً علی محمدی"
            />
          </label>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">کد ملی</span>
              <FieldValidationAdornment error={ownerNationalIdError}>
                <input
                  ref={nationalIdRef}
                  type="text"
                  inputMode="numeric"
                  value={nationalId}
                  onChange={(e) => onNationalIdChange(e.target.value)}
                  onBlur={() => {
                    if (showBlurValidation) setNationalIdTouched(true);
                  }}
                  onKeyDown={handleEnter(() => focusField(trackingCodeRef))}
                  className={reservationFormInputClass}
                  placeholder="0123456789"
                  dir="ltr"
                  maxLength={10}
                />
              </FieldValidationAdornment>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">
                پلاک ماشین
              </span>
              <input
                type="text"
                value={carPlate}
                onChange={(e) => onCarPlateChange(e.target.value)}
                className={reservationFormInputClass}
                placeholder="اختیاری — مثلاً 12ب345-67"
                dir="ltr"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm text-slate-600">کد رزرو</span>
            <input
              ref={trackingCodeRef}
              type="text"
              value={trackingCode}
              onChange={(e) => onTrackingCodeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                onTrackingCodeEnter?.();
              }}
              className={`${reservationFormInputClass} max-w-full !min-h-9 !py-2 !text-sm`}
              placeholder="خالی = خودکار"
              dir="ltr"
              autoComplete="off"
              maxLength={64}
            />
          </label>
        </div>

        {optionalFields === "collapsible" ? (
          <CollapsibleSection
            summary={PANEL_OPTIONAL_FIELDS_COLLAPSE_LABEL}
            summaryIcon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            }
          >
            {optionalFieldsContent}
          </CollapsibleSection>
        ) : optionalFields === "inline" ? (
          optionalFieldsContent
        ) : null}
      </div>
    );
  }

  const optionalFieldsContentDefault = (
    <PanelNewPilgrimOptionalFields
      nationalId={nationalId}
      carPlate={carPlate}
      gender={gender}
      birthDate={birthDate}
      travelOrigin={travelOrigin}
      country={country}
      passportNumber={passportNumber}
      nationalIdCardImageUrl={nationalIdCardImageUrl}
      submitting={submitting}
      showLocation={showLocation}
      province={province}
      city={city}
      onNationalIdChange={onNationalIdChange}
      onCarPlateChange={onCarPlateChange}
      onGenderChange={onGenderChange}
      onBirthDateChange={onBirthDateChange}
      onTravelOriginChange={onTravelOriginChange}
      onCountryChange={onCountryChange}
      onPassportNumberChange={onPassportNumberChange}
      onNationalIdCardImageUrlChange={onNationalIdCardImageUrlChange}
      onProvinceChange={onProvinceChange}
      onCityChange={onCityChange}
      nationalIdInputRef={nationalIdRef}
      password={password}
      onPasswordChange={onPasswordChange}
      {...optionalFieldValidationProps}
    />
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {mobileField}

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
            onKeyDown={
              optionalFields === "inline"
                ? handleEnter(() => focusField(nationalIdRef))
                : undefined
            }
            readOnly={isDuplicateWithKnownName}
            className={`${reservationFormInputClass}${
              isDuplicateWithKnownName ? " bg-slate-50 text-slate-700" : ""
            }`}
            placeholder="مثلاً علی محمدی"
          />
        </label>
      </div>

      {optionalFields === "collapsible" ? (
        <CollapsibleSection
          summary={PANEL_OPTIONAL_FIELDS_COLLAPSE_LABEL}
          summaryIcon={
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          }
        >
          {optionalFieldsContentDefault}
        </CollapsibleSection>
      ) : optionalFields === "inline" ? (
        optionalFieldsContentDefault
      ) : null}
    </div>
  );
}
