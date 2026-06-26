import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { guestTheme } from '../lib/guest-theme';
import { LOGIN_PORTAL_PARAM, getLoginPortalContent, parseLoginPortal } from '../lib/login-portal';
import { toastApiError } from '../lib/toast';

export function LoginPage() {
  const { user, login } = useAuth();
  const [searchParams] = useSearchParams();
  const portal = parseLoginPortal(searchParams.get(LOGIN_PORTAL_PARAM));
  const { title, subtitle } = getLoginPortalContent(portal);
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(mobileNumber, password);
    } catch (err) {
      toastApiError(err, 'خطا در ورود. لطفاً دوباره تلاش کنید.');
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
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

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
              minLength={4}
            />
            <p className="mt-1 text-xs text-slate-400">
              برای زائران: ۴ رقم آخر شماره موبایل
            </p>
          </label>
        </section>

        <button type="submit" disabled={loading} className={guestTheme.btnPrimaryLg}>
          {loading ? 'در حال ورود...' : 'ورود'}
        </button>
      </form>
    </div>
  );
}
