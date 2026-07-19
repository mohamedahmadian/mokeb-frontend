import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NavIcon } from '../ui/NavIcons';
import {
  emptyUserSocialFields,
  userSocialFieldsToPayload,
} from '../users/UserSocialFields';
import { RoleHero } from '../users/user-form-ui';
import {
  UserFormSections,
  type UserFormFieldValues,
} from '../users/UserFormSections';
import {
  isValidPinPassword,
  PIN_PASSWORD_ERROR,
  PIN_PASSWORD_HINT,
  PIN_PASSWORD_LENGTH,
} from '../../lib/pin-password';
import type { UserGender } from '../../types';
import { guestTheme } from '../../lib/guest-theme';
import { toast } from '../../lib/toast';
import { DEFAULT_USER_COUNTRY } from '../../lib/countries';
import { NationalIdCardUpload } from '../ui/NationalIdCardUpload';

export interface PilgrimRegistrationPayload {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  nationalId?: string;
  nationalIdCardImageUrl?: string;
  gender?: UserGender;
  birthDate?: string;
  country?: string;
  passportNumber?: string;
  password: string;
  province?: string;
  city?: string;
  description?: string;
  whatsapp?: string;
  telegram?: string;
  bale?: string;
  eitaa?: string;
  email?: string;
}

export interface MawkibOwnerRegistrationPayload {
  fullName: string;
  mobileNumber: string;
  nationalId?: string;
  gender?: UserGender;
  password: string;
  province?: string;
  city?: string;
  description?: string;
  whatsapp?: string;
  telegram?: string;
  bale?: string;
  eitaa?: string;
  email?: string;
}

type PublicRegistrationFormProps =
  | {
      variant: 'pilgrim';
      title: string;
      submitLabel?: string;
      loginHint?: string;
      onSubmit: (payload: PilgrimRegistrationPayload) => Promise<void>;
    }
  | {
      variant: 'mawkibOwner';
      title: string;
      submitLabel?: string;
      loginHint?: string;
      onSubmit: (payload: MawkibOwnerRegistrationPayload) => Promise<void>;
    };

const emptyForm = (): UserFormFieldValues => ({
  fullName: '',
  firstName: '',
  lastName: '',
  mobileNumber: '',
  nationalId: '',
  carPlate: '',
  gender: '' as UserGender | '',
  birthDate: '',
  country: DEFAULT_USER_COUNTRY,
  passportNumber: '',
  password: '',
  province: '',
  city: '',
  address: '',
  description: '',
  social: emptyUserSocialFields(),
});

export function PublicRegistrationForm(props: PublicRegistrationFormProps) {
  const [form, setForm] = useState<UserFormFieldValues>(emptyForm);
  const [nationalIdCardImageUrl, setNationalIdCardImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isPilgrim = props.variant === 'pilgrim';
  const role = isPilgrim ? 'Pilgrim' : 'MawkibOwner';

  const sharedOptionalPayload = {
    nationalId: form.nationalId.trim() || undefined,
    province: form.province.trim() || undefined,
    city: form.city.trim() || undefined,
    description: form.description.trim() || undefined,
    ...userSocialFieldsToPayload(form.social),
  };

  const patchForm = (patch: Partial<UserFormFieldValues>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPinPassword(form.password)) {
      toast.error(PIN_PASSWORD_ERROR);
      return;
    }

    setLoading(true);

    try {
      if (isPilgrim) {
        await props.onSubmit({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          password: form.password,
          gender: form.gender || undefined,
          birthDate: form.birthDate || undefined,
          country: form.country.trim() || DEFAULT_USER_COUNTRY,
          passportNumber: form.passportNumber || undefined,
          ...sharedOptionalPayload,
          nationalIdCardImageUrl: nationalIdCardImageUrl ?? undefined,
        });
      } else {
        await props.onSubmit({
          fullName: form.fullName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          password: form.password,
          gender: form.gender || undefined,
          ...sharedOptionalPayload,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${guestTheme.cardLg} w-full max-w-xl space-y-5`}>
      <RoleHero
        role={role}
        title={props.title}
        subtitle="ایجاد حساب کاربری در سامانه موکب"
      />

      <UserFormSections
        values={form}
        onChange={patchForm}
        nameMode={isPilgrim ? 'splitName' : 'fullName'}
        passwordRequired
        passwordPinMode
        passwordMinLength={PIN_PASSWORD_LENGTH}
        passwordHint={PIN_PASSWORD_HINT}
        extraFields="collapsible"
        showGender
        showBirthDate={isPilgrim}
      />

      {isPilgrim && (
        <NationalIdCardUpload
          value={nationalIdCardImageUrl}
          onChange={setNationalIdCardImageUrl}
          disabled={loading}
        />
      )}

      <button type="submit" disabled={loading} className={`${guestTheme.btnPrimaryLg} w-full`}>
        <NavIcon name="register" className="h-4 w-4" />
        {loading ? 'در حال ثبت‌نام...' : (props.submitLabel ?? 'ثبت‌نام')}
      </button>

      <p className="text-center text-sm text-slate-500">
        {props.loginHint ?? 'حساب دارید؟'}{' '}
        <Link to="/login" className="inline-flex items-center gap-1 font-medium text-[#4a6fa5] hover:underline">
          <NavIcon name="login" className="h-4 w-4" />
          ورود
        </Link>
      </p>
    </form>
  );
}
