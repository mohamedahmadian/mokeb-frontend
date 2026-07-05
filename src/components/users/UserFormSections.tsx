import { useRef, type KeyboardEvent } from 'react';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { ProvinceCitySelect } from '../ui/ProvinceCitySelect';
import { PersianDateInput } from '../ui/PersianDateInput';
import { NavIcon } from '../ui/NavIcons';
import {
  FieldLabel,
  FormSection,
  MapPinIcon,
  PasswordInput,
} from './user-form-ui';
import {
  UserSocialFields,
  type UserSocialFormValues,
} from './UserSocialFields';
import { GenderSelect } from '../ui/GenderSelect';
import { CountrySelect } from '../ui/CountrySelect';
import { guestTheme } from '../../lib/guest-theme';
import type { UserGender } from '../../types';

export interface UserFormFieldValues {
  fullName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  nationalId: string;
  gender: UserGender | '';
  birthDate: string;
  country: string;
  passportNumber: string;
  password: string;
  province: string;
  city: string;
  description: string;
  social: UserSocialFormValues;
}

export type UserFormNameMode = 'fullName' | 'splitName';

export type UserFormPrimaryLayout = 'default' | 'quickPilgrim' | 'mawkibOwner';
export type MobileCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate';

export interface UserFormSectionsProps {
  values: UserFormFieldValues;
  onChange: (patch: Partial<UserFormFieldValues>) => void;
  nameMode: UserFormNameMode;
  mobileDisabled?: boolean;
  passwordRequired?: boolean;
  passwordMinLength?: number;
  passwordPinMode?: boolean;
  passwordPlaceholder?: string;
  passwordHint?: string;
  /** inline: همه بخش‌ها باز | collapsible: موقعیت و بعد اختیاری در آکاردئون */
  extraFields?: 'inline' | 'collapsible';
  /** نمایش استان/شهر در بخش اطلاعات اصلی (مثلاً ویرایش پروفایل) */
  locationInPrimary?: boolean;
  descriptionLabel?: string;
  className?: string;
  primaryLayout?: UserFormPrimaryLayout;
  mobileCheckStatus?: MobileCheckStatus;
  hideOptionalLabels?: boolean;
  onPasswordEnter?: () => void;
  onMobileBlur?: (mobile: string) => void;
  showGender?: boolean;
  showBirthDate?: boolean;
}

function MobileAvailableIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function GenderField({
  value,
  onChange,
  required = false,
}: {
  value: UserGender | '';
  onChange: (gender: UserGender | '') => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <FieldLabel label="جنسیت" required={required} />
      <GenderSelect
        value={value}
        onChange={onChange}
        required={required}
        variant="guest"
      />
    </label>
  );
}

function todayDateString() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function BirthDateField({
  value,
  onChange,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}) {
  return (
    <label className="block">
      <FieldLabel label="تاریخ تولد" />
      <PersianDateInput
        compact
        value={value}
        onChange={onChange}
        maxDate={todayDateString()}
        inputClassName={inputClassName ?? guestTheme.input}
      />
    </label>
  );
}

function CountryField({
  value,
  onChange,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}) {
  return (
    <label className="block">
      <FieldLabel label="کشور" />
      <CountrySelect
        value={value}
        onChange={onChange}
        inputClassName={inputClassName ?? guestTheme.input}
      />
    </label>
  );
}

function PassportNumberField({
  value,
  onChange,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
}) {
  return (
    <label className="block">
      <FieldLabel label="شماره گذرنامه" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName ?? guestTheme.input}
        placeholder="شماره گذرنامه"
        dir="ltr"
      />
    </label>
  );
}

function PilgrimExtraFields({
  values,
  onChange,
  inputClassName,
}: {
  values: UserFormFieldValues;
  onChange: (patch: Partial<UserFormFieldValues>) => void;
  inputClassName?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CountryField
          value={values.country}
          onChange={(country) => onChange({ country, province: '', city: '' })}
          inputClassName={inputClassName}
        />
        <PassportNumberField
          value={values.passportNumber}
          onChange={(passportNumber) => onChange({ passportNumber })}
          inputClassName={inputClassName}
        />
      </div>
      <BirthDateField
        value={values.birthDate}
        onChange={(birthDate) => onChange({ birthDate })}
        inputClassName={inputClassName}
      />
    </div>
  );
}

function MawkibOwnerPrimaryFieldsSection({
  values,
  onChange,
  mobileDisabled,
  passwordRequired,
  passwordMinLength,
  passwordPlaceholder,
  passwordHint,
  mobileCheckStatus = 'idle',
  onMobileBlur,
}: Pick<
  UserFormSectionsProps,
  | 'values'
  | 'onChange'
  | 'mobileDisabled'
  | 'passwordRequired'
  | 'passwordMinLength'
  | 'passwordPlaceholder'
  | 'passwordHint'
  | 'mobileCheckStatus'
  | 'onMobileBlur'
>) {
  return (
    <FormSection title="اطلاعات اصلی" icon={<NavIcon name="profile" className="h-4 w-4" />}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel label="تلفن همراه" required />
          <input
            type="tel"
            required
            disabled={mobileDisabled}
            value={values.mobileNumber}
            onChange={(e) => onChange({ mobileNumber: e.target.value })}
            onBlur={(e) => onMobileBlur?.(e.target.value)}
            className={`${guestTheme.input} disabled:bg-slate-100 disabled:text-slate-500`}
            placeholder="09121234567"
            dir="ltr"
          />
          {mobileCheckStatus === 'duplicate' && (
            <p className="mt-1 text-xs text-red-600">این شماره موبایل تکراری است</p>
          )}
        </label>

        <label className="block">
          <FieldLabel label="نام و نام خانوادگی" required />
          <input
            type="text"
            required
            value={values.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className={guestTheme.input}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PasswordInput
          value={values.password}
          onChange={(password) => onChange({ password })}
          required={passwordRequired}
          placeholder={passwordPlaceholder}
          hint={passwordHint}
          minLength={passwordMinLength}
        />
        <label className="block">
          <FieldLabel label="کد ملی" />
          <input
            type="text"
            inputMode="numeric"
            value={values.nationalId}
            onChange={(e) => onChange({ nationalId: e.target.value })}
            className={guestTheme.input}
            placeholder="0123456789"
            dir="ltr"
            maxLength={10}
          />
        </label>
      </div>

      <GenderField
        value={values.gender}
        onChange={(gender) => onChange({ gender })}
        required={false}
      />
    </FormSection>
  );
}

function QuickPilgrimPrimaryFieldsSection({
  values,
  onChange,
  mobileDisabled,
  passwordRequired,
  passwordMinLength,
  passwordPinMode,
  passwordPlaceholder,
  mobileCheckStatus = 'idle',
  onPasswordEnter,
  showGender = false,
  showBirthDate = false,
}: Pick<
  UserFormSectionsProps,
  | 'values'
  | 'onChange'
  | 'mobileDisabled'
  | 'passwordRequired'
  | 'passwordMinLength'
  | 'passwordPinMode'
  | 'passwordPlaceholder'
  | 'mobileCheckStatus'
  | 'onPasswordEnter'
  | 'showGender'
  | 'showBirthDate'
>) {
  const fullNameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const nationalIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const focusField = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.focus();
  };

  const handleEnter =
    (next: () => void) => (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      next();
    };

  return (
    <FormSection title="اطلاعات اصلی" icon={<NavIcon name="profile" className="h-4 w-4" />}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <FieldLabel label="شماره موبایل" required />
          <div className="flex items-start gap-2">
            <input
              ref={mobileRef}
              type="tel"
              required
              disabled={mobileDisabled}
              value={values.mobileNumber}
              onChange={(e) => onChange({ mobileNumber: e.target.value })}
              onKeyDown={handleEnter(() => focusField(nationalIdRef))}
              className={`${guestTheme.input} min-w-0 flex-1 disabled:bg-slate-100 disabled:text-slate-500`}
              placeholder="09121234567"
              dir="ltr"
            />
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
          {mobileCheckStatus === 'duplicate' && (
            <p className="mt-1 text-xs text-amber-700">
              این شماره تلفن همراه قبلا در سیستم ثبت نام شده است
            </p>
          )}
        </label>
        <label className="block">
          <FieldLabel label="کد ملی" />
          <input
            ref={nationalIdRef}
            type="text"
            inputMode="numeric"
            value={values.nationalId}
            onChange={(e) => onChange({ nationalId: e.target.value })}
            onKeyDown={handleEnter(() => focusField(passwordRef))}
            className={guestTheme.input}
            placeholder="0123456789"
            dir="ltr"
            maxLength={10}
          />
        </label>
        <PasswordInput
          value={values.password}
          onChange={(password) => onChange({ password })}
          required={passwordRequired}
          placeholder={passwordPlaceholder}
          minLength={passwordMinLength}
          pinMode={passwordPinMode}
          inputRef={passwordRef}
          onKeyDown={handleEnter(() => onPasswordEnter?.())}
        />
      </div>

      {showGender && (
        <GenderField
          value={values.gender}
          onChange={(gender) => onChange({ gender })}
        />
      )}

      {showBirthDate && (
        <PilgrimExtraFields values={values} onChange={onChange} />
      )}

      <label className="block">
        <FieldLabel label="نام و نام خانوادگی" required />
        <input
          ref={fullNameRef}
          type="text"
          required
          value={values.fullName}
          onChange={(e) => onChange({ fullName: e.target.value })}
          onKeyDown={handleEnter(() => focusField(mobileRef))}
          className={guestTheme.input}
        />
      </label>
    </FormSection>
  );
}

function PrimaryFieldsSection({
  values,
  onChange,
  nameMode,
  mobileDisabled,
  passwordRequired,
  passwordMinLength,
  passwordPinMode,
  passwordPlaceholder,
  passwordHint,
  locationInPrimary,
  showGender = false,
  showBirthDate = false,
}: Pick<
  UserFormSectionsProps,
  | 'values'
  | 'onChange'
  | 'nameMode'
  | 'mobileDisabled'
  | 'passwordRequired'
  | 'passwordMinLength'
  | 'passwordPinMode'
  | 'passwordPlaceholder'
  | 'passwordHint'
  | 'locationInPrimary'
  | 'showGender'
  | 'showBirthDate'
>) {
  return (
    <FormSection title="اطلاعات اصلی" icon={<NavIcon name="profile" className="h-4 w-4" />}>
      {nameMode === 'splitName' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <FieldLabel label="نام" required />
            <input
              type="text"
              required
              value={values.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              className={guestTheme.input}
            />
          </label>
          <label className="block">
            <FieldLabel label="نام خانوادگی" required />
            <input
              type="text"
              required
              value={values.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              className={guestTheme.input}
            />
          </label>
        </div>
      ) : (
        <label className="block">
          <FieldLabel label="نام کامل" required />
          <input
            type="text"
            required
            value={values.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className={guestTheme.input}
          />
        </label>
      )}

      {locationInPrimary && (
        <ProvinceCitySelect
          country={values.country}
          province={values.province}
          city={values.city}
          onProvinceChange={(province) => onChange({ province, city: '' })}
          onCityChange={(city) => onChange({ city })}
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel label="شماره موبایل" required />
          <input
            type="tel"
            required
            disabled={mobileDisabled}
            value={values.mobileNumber}
            onChange={(e) => onChange({ mobileNumber: e.target.value })}
            className={`${guestTheme.input} disabled:bg-slate-100 disabled:text-slate-500`}
            placeholder="09121234567"
            dir="ltr"
          />
        </label>
        <label className="block">
          <FieldLabel label="کد ملی" />
          <input
            type="text"
            inputMode="numeric"
            value={values.nationalId}
            onChange={(e) => onChange({ nationalId: e.target.value })}
            className={guestTheme.input}
            placeholder="0123456789"
            dir="ltr"
            maxLength={10}
          />
        </label>
      </div>

      {showGender ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <GenderField
            value={values.gender}
            onChange={(gender) => onChange({ gender })}
          />
          <PasswordInput
            value={values.password}
            onChange={(password) => onChange({ password })}
            required={passwordRequired}
            placeholder={passwordPlaceholder}
            hint={passwordHint}
            minLength={passwordMinLength}
            pinMode={passwordPinMode}
          />
        </div>
      ) : (
        <PasswordInput
          value={values.password}
          onChange={(password) => onChange({ password })}
          required={passwordRequired}
          placeholder={passwordPlaceholder}
          hint={passwordHint}
          minLength={passwordMinLength}
          pinMode={passwordPinMode}
        />
      )}

      {showBirthDate && (
        <PilgrimExtraFields values={values} onChange={onChange} />
      )}
    </FormSection>
  );
}

function LocationSection({
  values,
  onChange,
}: Pick<UserFormSectionsProps, 'values' | 'onChange'>) {
  return (
    <FormSection title="موقعیت" icon={<MapPinIcon />}>
      <ProvinceCitySelect
        country={values.country}
        province={values.province}
        city={values.city}
        onProvinceChange={(province) => onChange({ province, city: '' })}
        onCityChange={(city) => onChange({ city })}
      />
    </FormSection>
  );
}

function DescriptionSection({
  values,
  onChange,
  optionalHint = 'اختیاری',
  descriptionLabel = 'درباره شما',
  hideOptionalLabels = false,
}: Pick<UserFormSectionsProps, 'values' | 'onChange' | 'descriptionLabel' | 'hideOptionalLabels'> & {
  optionalHint?: string;
}) {
  return (
    <FormSection title="توضیحات" icon={<NavIcon name="book" className="h-4 w-4" />}>
      <label className="block">
        <FieldLabel
          label={descriptionLabel}
          hint={hideOptionalLabels ? undefined : optionalHint}
        />
        <textarea
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className={`${guestTheme.input} resize-none`}
          placeholder="یادداشت یا توضیح تکمیلی..."
        />
      </label>
    </FormSection>
  );
}

function SocialSection({
  values,
  onChange,
  hideOptionalLabels = false,
}: Pick<UserFormSectionsProps, 'values' | 'onChange' | 'hideOptionalLabels'>) {
  return (
    <UserSocialFields
      values={values.social}
      onChange={(social) => onChange({ social })}
      variant="section"
      hideOptionalLabel={hideOptionalLabels}
    />
  );
}

export function UserFormSections({
  values,
  onChange,
  nameMode,
  mobileDisabled,
  passwordRequired = true,
  passwordMinLength = 4,
  passwordPinMode,
  passwordPlaceholder,
  passwordHint,
  extraFields = 'inline',
  locationInPrimary = false,
  descriptionLabel,
  className = 'space-y-4',
  primaryLayout = 'default',
  mobileCheckStatus,
  hideOptionalLabels = false,
  onPasswordEnter,
  onMobileBlur,
  showGender = false,
  showBirthDate = false,
}: UserFormSectionsProps) {
  const primary =
    primaryLayout === 'quickPilgrim' ? (
      <QuickPilgrimPrimaryFieldsSection
        values={values}
        onChange={onChange}
        mobileDisabled={mobileDisabled}
        passwordRequired={passwordRequired}
        passwordMinLength={passwordMinLength}
        passwordPinMode={passwordPinMode}
        passwordPlaceholder={passwordPlaceholder}
        mobileCheckStatus={mobileCheckStatus}
        onPasswordEnter={onPasswordEnter}
        showGender={showGender}
        showBirthDate={showBirthDate}
      />
    ) : primaryLayout === 'mawkibOwner' ? (
      <MawkibOwnerPrimaryFieldsSection
        values={values}
        onChange={onChange}
        mobileDisabled={mobileDisabled}
        passwordRequired={passwordRequired}
        passwordMinLength={passwordMinLength}
        passwordPlaceholder={passwordPlaceholder}
        passwordHint={passwordHint}
        mobileCheckStatus={mobileCheckStatus}
        onMobileBlur={onMobileBlur}
      />
    ) : (
      <PrimaryFieldsSection
        values={values}
        onChange={onChange}
        nameMode={nameMode}
        mobileDisabled={mobileDisabled}
        passwordRequired={passwordRequired}
        passwordMinLength={passwordMinLength}
        passwordPinMode={passwordPinMode}
        passwordPlaceholder={passwordPlaceholder}
        passwordHint={passwordHint}
        locationInPrimary={locationInPrimary}
        showGender={showGender}
        showBirthDate={showBirthDate}
      />
    );

  const extras = (
    <>
      {!locationInPrimary && (
        <LocationSection values={values} onChange={onChange} />
      )}
      <DescriptionSection
        values={values}
        onChange={onChange}
        descriptionLabel={descriptionLabel}
        hideOptionalLabels={hideOptionalLabels}
      />
      <SocialSection
        values={values}
        onChange={onChange}
        hideOptionalLabels={hideOptionalLabels}
      />
    </>
  );

  if (extraFields === 'collapsible') {
    return (
      <div className={className}>
        {primary}
        <CollapsibleSection summary="اطلاعات تکمیلی (اختیاری)">
          <p className="flex items-start gap-2 text-xs leading-6 text-slate-500">
            <NavIcon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-[#4a6fa5]" />
            پر کردن موارد زیر الزامی نیست و پس از ورود به پنل قابل تغییر است.
          </p>
          <div className="space-y-4">{extras}</div>
        </CollapsibleSection>
      </div>
    );
  }

  return (
    <div className={className}>
      {primary}
      {extras}
    </div>
  );
}
