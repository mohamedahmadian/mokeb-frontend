import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PublicFooter } from './PublicFooter';
import { PublicNavbar } from './PublicNavbar';

export function PublicLayout() {
  const { loading } = useAuth();

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-[#f4f6f9]">
      {!loading && <PublicNavbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!loading && <PublicFooter />}
    </div>
  );
}
