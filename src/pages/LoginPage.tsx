import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../lib/constants';
import { guestTheme } from '../lib/guest-theme';

export function LoginPage() {
  const { user, login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(mobileNumber, password);
    } catch (err) {
      setError(getApiErrorMessage(err, 'خطا در ورود. لطفاً دوباره تلاش کنید.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="guest-theme flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-[#f4f6f9] p-4 text-slate-700">
      <form
        onSubmit={handleSubmit}
        className={`${guestTheme.cardLg} h-fit w-full max-w-lg space-y-5`}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">ورود به سامانه</h1>
          <p className="mt-1 text-sm text-slate-500">ورود به حساب کاربری در سامانه</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <section className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">شماره موبایل</span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className={guestTheme.input}
              placeholder="09121234567"
              dir="ltr"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">رمز عبور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={guestTheme.input}
              required
            />
          </label>
        </section>

        <button type="submit" disabled={loading} className={guestTheme.btnPrimaryLg}>
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>
    </div>
  );
}
