import { inputClass } from '../../lib/styles';
import { guestTheme } from '../../lib/guest-theme';
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
  variant?: 'default' | 'section';
  inputClassName?: string;
}

const socialIcons: Record<string, React.ReactNode> = {
  whatsapp: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  telegram: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  bale: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  eitaa: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  email: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
};

export function UserSocialFields({
  values,
  onChange,
  compact = false,
  variant = 'default',
  inputClassName = inputClass,
}: UserSocialFieldsProps) {
  const setField = (key: keyof UserSocialFormValues, value: string) => {
    onChange({ ...values, [key]: value });
  };

  const fieldsGrid = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {SOCIAL_FIELD_CONFIG.map(({ key, label, placeholder, type }) => (
        <label key={key} className="block">
          {variant === 'section' ? (
            <span className="mb-1.5 flex items-center gap-2 text-sm text-slate-600">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0f4fa] text-[#4a6fa5]">
                {socialIcons[key]}
              </span>
              {label}
            </span>
          ) : (
            <span className="mb-1 block text-sm text-slate-600">{label}</span>
          )}
          <input
            type={type ?? 'text'}
            value={values[key]}
            onChange={(e) => setField(key, e.target.value)}
            className={variant === 'section' ? guestTheme.input : inputClassName}
            placeholder={placeholder}
            dir={type === 'email' ? 'ltr' : undefined}
          />
        </label>
      ))}
    </div>
  );

  if (variant === 'section') {
    return (
      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-3.5 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
            {socialIcons.telegram}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">شبکه‌های اجتماعی</h3>
            <p className="text-xs text-slate-500">اختیاری</p>
          </div>
        </div>
        <div className="p-3.5">{fieldsGrid}</div>
      </section>
    );
  }

  return (
    <fieldset className={compact ? undefined : 'rounded-lg border border-slate-200 p-4'}>
      {!compact && (
        <legend className="px-1 text-sm font-medium text-slate-700">شبکه‌های اجتماعی</legend>
      )}
      {compact && (
        <p className="mb-2 text-sm font-medium text-slate-700">شبکه‌های اجتماعی (اختیاری)</p>
      )}
      {fieldsGrid}
    </fieldset>
  );
}
