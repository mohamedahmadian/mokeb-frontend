import { Navigate, useNavigate } from 'react-router-dom';
import { PublicRegistrationForm } from '../components/guest/PublicRegistrationForm';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../lib/auth';
import { getApiErrorMessage } from '../lib/constants';
import { guestTheme } from '../lib/guest-theme';

export function RegisterPage() {
  const { user, setSession } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`${guestTheme.page} flex justify-center p-4 py-8`}>
      <PublicRegistrationForm
        variant="pilgrim"
        title="ثبت‌نام زائر"
        onSubmit={async (payload) => {
          try {
            const data = await authApi.registerPilgrim(payload);
            setSession(data);
            navigate('/dashboard', { replace: true });
          } catch (err) {
            throw new Error(getApiErrorMessage(err, 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.'));
          }
        }}
      />
    </div>
  );
}
