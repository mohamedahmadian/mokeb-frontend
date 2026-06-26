import { useState, type FormEvent } from 'react';
import { guestTheme } from '../../lib/guest-theme';
import { toast, toastApiError } from '../../lib/toast';

interface HonoraryVolunteerLoginStepProps {
  onBack: () => void;
  onLogin: (mobileNumber: string, password: string) => Promise<void>;
}

export function HonoraryVolunteerLoginStep({ onBack, onLogin }: HonoraryVolunteerLoginStepProps) {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!mobileNumber.trim() || !password.trim()) {
      toast.error('شماره موبایل و رمز عبور الزامی است');
      return;
    }

    setSubmitting(true);
    try {
      await onLogin(mobileNumber.trim(), password);
    } catch (err) {
      toastApiError(err, 'ورود ناموفق بود. اطلاعات را بررسی کنید.');
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
