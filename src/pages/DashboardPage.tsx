import { useAuth } from '../contexts/AuthContext';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { MawkibOwnerDashboard } from '../components/dashboard/MawkibOwnerDashboard';
import { PilgrimDashboard } from '../components/dashboard/PilgrimDashboard';

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const hasMawkibOwnerRole = user?.roles.includes('MawkibOwner') ?? false;
  const isAdmin = user?.roles.includes('Admin') ?? false;
  const isPilgrim =
    (user?.roles.includes('Pilgrim') ?? false) &&
    !hasMawkibOwnerRole &&
    !isAdmin;

  if (authLoading) {
    return <p className="text-slate-500">در حال بارگذاری...</p>;
  }

  if (hasMawkibOwnerRole) {
    return <MawkibOwnerDashboard fullName={user?.fullName ?? ''} />;
  }

  if (isPilgrim) {
    return <PilgrimDashboard fullName={user?.fullName ?? ''} />;
  }

  if (isAdmin) {
    return <AdminDashboard fullName={user?.fullName ?? ''} />;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">داشبورد</h1>
      <p className="mt-2 text-sm text-slate-500">به سامانه موکب خوش آمدید.</p>
    </div>
  );
}
