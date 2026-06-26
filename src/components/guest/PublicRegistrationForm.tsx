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
import { guestTheme } from '../../lib/guest-theme';
import { toast } from '../../lib/toast';

export interface PilgrimRegistrationPayload {
  firstName: string;
  lastName: string;
  mobileNumber: string;
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
  password: '',
  province: '',
  city: '',
  description: '',
  social: emptyUserSocialFields(),
});

export function PublicRegistrationForm(props: PublicRegistrationFormProps) {
  const [form, setForm] = useState<UserFormFieldValues>(emptyForm);
  const [loading, setLoading] = useState(false);

  const isPilgrim = props.variant === 'pilgrim';
  const role = isPilgrim ? 'Pilgrim' : 'MawkibOwner';
  const minPasswordLength = isPilgrim ? 4 : 6;

  const optionalPayload = {
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

    if (form.password.length < minPasswordLength) {
      toast.error(
        `رمز عبور باید حداقل ${minPasswordLength.toLocaleString('fa-IR')} کاراکتر باشد`,
      );
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
          ...optionalPayload,
        });
      } else {
        await props.onSubmit({
          fullName: form.fullName.trim(),
          mobileNumber: form.mobileNumber.trim(),
          password: form.password,
          ...optionalPayload,
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
        passwordMinLength={minPasswordLength}
        passwordHint={
          isPilgrim
            ? 'حداقل ۴ کاراکتر (مثلاً ۴ رقم آخر موبایل)'
            : 'حداقل ۶ کاراکتر'
        }
        extraFields="collapsible"
      />

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
