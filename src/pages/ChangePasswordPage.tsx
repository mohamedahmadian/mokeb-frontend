import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { NavIcon } from '../components/ui/NavIcons';
import { authApi } from '../lib/auth';
import { guestTheme } from '../lib/guest-theme';
import { toast, toastApiError } from '../lib/toast';

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-600">{label}</span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className={`${guestTheme.input} pl-11`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 transition hover:text-slate-600"
          tabIndex={-1}
        >
          {visible ? 'پنهان' : 'نمایش'}
        </button>
      </div>
    </label>
  );
}

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      }),
    onSuccess: (result) => {
      toast.success(result.message);
      navigate('/profile');
    },
    onError: (error) => {
      toastApiError(error, 'خطا در تغییر رمز عبور');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.trim().length < 4) {
      toast.error('رمز عبور جدید باید حداقل ۴ کاراکتر باشد');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('تکرار رمز عبور جدید با رمز جدید یکسان نیست');
      return;
    }

    mutation.mutate();
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Link
        to="/profile"
        className={`${guestTheme.btnGhost} mb-4 inline-flex items-center gap-1.5`}
      >
        <NavIcon name="chevron" className="h-4 w-4 rotate-90" strokeWidth={2} />
        بازگشت به پروفایل
      </Link>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
              <NavIcon name="key" className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">تغییر رمز عبور</h1>
              <p className="mt-0.5 text-xs text-slate-500">
                رمز فعلی و رمز جدید خود را وارد کنید
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <PasswordField
            label="رمز عبور فعلی *"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
          <PasswordField
            label="رمز عبور جدید *"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
          />
          <PasswordField
            label="تکرار رمز عبور جدید *"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />

          <p className="text-xs leading-6 text-slate-500">
            رمز عبور جدید باید حداقل ۴ کاراکتر باشد و با رمز فعلی متفاوت باشد.
          </p>

          <button
            type="submit"
            disabled={mutation.isPending}
            className={`${guestTheme.btnPrimary} w-full py-3`}
          >
            {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره رمز جدید'}
          </button>
        </form>
      </section>
    </div>
  );
}
