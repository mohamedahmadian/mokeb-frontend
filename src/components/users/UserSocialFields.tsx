import { inputClass } from '../../lib/styles';
import type { UserSocialFields as UserSocialFieldsType } from '../../types';

export type UserSocialFormValues = Required<UserSocialFieldsType>;

export const SOCIAL_FIELD_CONFIG = [
  { key: 'whatsapp' as const, label: 'واتس‌اپ', placeholder: 'شماره یا آیدی واتس‌اپ' },
  { key: 'telegram' as const, label: 'تلگرام', placeholder: 'آیدی تلگرام' },
  { key: 'bale' as const, label: 'بله', placeholder: 'شماره یا آیدی بله' },
  { key: 'eitaa' as const, label: 'ایتا', placeholder: 'شماره یا آیدی ایتا' },
  { key: 'email' as const, label: 'ایمیل', placeholder: 'example@mail.com', type: 'email' as const },
];

export function emptyUserSocialFields(): UserSocialFormValues {
  return {
    whatsapp: '',
    telegram: '',
    bale: '',
    eitaa: '',
    email: '',
  };
}

export function userSocialFieldsFromUser(
  user?: Partial<UserSocialFormValues> | null,
): UserSocialFormValues {
  return {
    whatsapp: user?.whatsapp ?? '',
    telegram: user?.telegram ?? '',
    bale: user?.bale ?? '',
    eitaa: user?.eitaa ?? '',
    email: user?.email ?? '',
  };
}

export function userSocialFieldsToPayload(
  fields: UserSocialFormValues,
): UserSocialFieldsType {
  return {
    whatsapp: fields.whatsapp?.trim() || undefined,
    telegram: fields.telegram?.trim() || undefined,
    bale: fields.bale?.trim() || undefined,
    eitaa: fields.eitaa?.trim() || undefined,
    email: fields.email?.trim() || undefined,
  };
}

export function hasAnySocialField(user?: Partial<UserSocialFormValues> | null): boolean {
  return SOCIAL_FIELD_CONFIG.some(({ key }) => !!user?.[key]?.trim());
}

interface UserSocialFieldsProps {
  values: UserSocialFormValues;
  onChange: (values: UserSocialFormValues) => void;
  compact?: boolean;
  inputClassName?: string;
}

export function UserSocialFields({
  values,
  onChange,
  compact = false,
  inputClassName = inputClass,
}: UserSocialFieldsProps) {
  const setField = (key: keyof UserSocialFormValues, value: string) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <fieldset className={compact ? undefined : 'rounded-lg border border-slate-200 p-4'}>
      {!compact && (
        <legend className="px-1 text-sm font-medium text-slate-700">شبکه‌های اجتماعی</legend>
      )}
      {compact && (
        <p className="mb-2 text-sm font-medium text-slate-700">شبکه‌های اجتماعی (اختیاری)</p>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SOCIAL_FIELD_CONFIG.map(({ key, label, placeholder, type }) => (
          <label key={key} className="block">
            <span className="mb-1 block text-sm text-slate-600">{label}</span>
            <input
              type={type ?? 'text'}
              value={values[key]}
              onChange={(e) => setField(key, e.target.value)}
              className={inputClassName}
              placeholder={placeholder}
              dir={type === 'email' ? 'ltr' : undefined}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
