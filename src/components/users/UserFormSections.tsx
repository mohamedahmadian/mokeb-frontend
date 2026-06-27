import { CollapsibleSection } from '../ui/CollapsibleSection';
import { ProvinceCitySelect } from '../ui/ProvinceCitySelect';
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
import { guestTheme } from '../../lib/guest-theme';

export interface UserFormFieldValues {
  fullName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  password: string;
  province: string;
  city: string;
  description: string;
  social: UserSocialFormValues;
}

export type UserFormNameMode = 'fullName' | 'splitName';

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
  descriptionLabel?: string;
  className?: string;
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

      <PasswordInput
        value={values.password}
        onChange={(password) => onChange({ password })}
        required={passwordRequired}
        placeholder={passwordPlaceholder}
        hint={passwordHint}
        minLength={passwordMinLength}
        pinMode={passwordPinMode}
      />
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
}: Pick<UserFormSectionsProps, 'values' | 'onChange' | 'descriptionLabel'> & {
  optionalHint?: string;
}) {
  return (
    <FormSection title="توضیحات" icon={<NavIcon name="book" className="h-4 w-4" />}>
      <label className="block">
        <FieldLabel label={descriptionLabel} hint={optionalHint} />
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
}: Pick<UserFormSectionsProps, 'values' | 'onChange'>) {
  return (
    <UserSocialFields
      values={values.social}
      onChange={(social) => onChange({ social })}
      variant="section"
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
  descriptionLabel,
  className = 'space-y-4',
}: UserFormSectionsProps) {
  const primary = (
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
    />
  );

  const extras = (
    <>
      <LocationSection values={values} onChange={onChange} />
      <DescriptionSection
        values={values}
        onChange={onChange}
        descriptionLabel={descriptionLabel}
      />
      <SocialSection values={values} onChange={onChange} />
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
