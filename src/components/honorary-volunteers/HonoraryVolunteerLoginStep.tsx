import { useState, type FormEvent } from 'react';
import { guestTheme } from '../../lib/guest-theme';
import { getApiErrorMessage } from '../../lib/constants';

interface HonoraryVolunteerLoginStepProps {
  onBack: () => void;
  onLogin: (mobileNumber: string, password: string) => Promise<void>;
}

export function HonoraryVolunteerLoginStep({ onBack, onLogin }: HonoraryVolunteerLoginStepProps) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobileNumber.trim() || !password.trim()) {
      setError('شماره موبایل و رمز عبور الزامی است');
      return;
    }

    setSubmitting(true);
    try {
      await onLogin(mobileNumber.trim(), password);
    } catch (err) {
      setError(getApiErrorMessage(err, 'ورود ناموفق بود. اطلاعات را بررسی کنید.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${guestTheme.cardLg} space-y-4`}>
      <p className="text-sm leading-7 text-slate-600">
        برای ادامه، با حساب کاربری موجود خود وارد شوید. اطلاعات هویتی شما به‌صورت خودکار در فرم
        اعلام آمادگی استفاده می‌شود.
      </p>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>}

      <label className="block">
        <span className="mb-1.5 block text-sm text-slate-600">شماره موبایل *</span>
        <input
          type="tel"
          required
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          className={guestTheme.input}
          dir="ltr"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm text-slate-600">رمز عبور *</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={guestTheme.input}
        />
      </label>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onBack} className={`${guestTheme.btnSecondary} w-full sm:w-auto`}>
          بازگشت
        </button>
        <button type="submit" disabled={submitting} className={`${guestTheme.btnPrimaryLg} sm:w-auto sm:px-8`}>
          {submitting ? 'در حال ورود...' : 'ادامه'}
        </button>
      </div>
    </form>
  );
}
