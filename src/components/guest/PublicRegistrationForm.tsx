import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProvinceCitySelect } from '../ui/ProvinceCitySelect';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import {
  UserSocialFields,
  emptyUserSocialFields,
  userSocialFieldsToPayload,
} from '../users/UserSocialFields';
import { guestTheme } from '../../lib/guest-theme';

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

export function PublicRegistrationForm(props: PublicRegistrationFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [social, setSocial] = useState(emptyUserSocialFields());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const optionalPayload = {
    province: province.trim() || undefined,
    city: city.trim() || undefined,
    description: description.trim() || undefined,
    ...userSocialFieldsToPayload(social),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (props.variant === 'pilgrim') {
        await props.onSubmit({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          mobileNumber: mobileNumber.trim(),
          password,
          ...optionalPayload,
        });
      } else {
        await props.onSubmit({
          fullName: fullName.trim(),
          mobileNumber: mobileNumber.trim(),
          password,
          ...optionalPayload,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${guestTheme.cardLg} w-full max-w-lg space-y-5`}>
      <div>
        <h1 className="text-xl font-bold text-slate-800">{props.title}</h1>
        <p className="mt-1 text-sm text-slate-500">ایجاد حساب کاربری در سامانه</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">اطلاعات ضروری</h2>

        {props.variant === 'pilgrim' ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-600">نام *</span>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={guestTheme.input}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-600">نام خانوادگی *</span>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={guestTheme.input}
              />
            </label>
          </div>
        ) : (
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">نام کامل *</span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={guestTheme.input}
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">شماره موبایل *</span>
          <input
            type="tel"
            required
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            className={guestTheme.input}
            placeholder="09121234567"
            dir="ltr"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">رمز عبور *</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={guestTheme.input}
          />
          <p className="mt-1 text-xs text-slate-400">حداقل ۶ کاراکتر</p>
        </label>
      </section>

      <CollapsibleSection summary="جهت وارد کردن اطلاعات بیشتر کلیک نمایید">
        <p className="text-xs leading-6 text-slate-500">
          پر کردن موارد زیر الزامی نیست و پس از ورود به پنل قابل تغییر است.
        </p>

        <ProvinceCitySelect
          province={province}
          city={city}
          onProvinceChange={(p) => {
            setProvince(p);
            setCity('');
          }}
          onCityChange={setCity}
        />

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">توضیحات</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={`${guestTheme.input} resize-none`}
          />
        </label>

        <UserSocialFields values={social} onChange={setSocial} compact inputClassName={guestTheme.input} />
      </CollapsibleSection>

      <button type="submit" disabled={loading} className={`${guestTheme.btnPrimaryLg} w-full`}>
        {loading ? 'در حال ثبت‌نام...' : (props.submitLabel ?? 'ثبت‌نام')}
      </button>

      <p className="text-center text-sm text-slate-500">
        {props.loginHint ?? 'حساب دارید؟'}{' '}
        <Link to="/login" className="font-medium text-[#4a6fa5] hover:underline">
          ورود
        </Link>
      </p>
    </form>
  );
}
