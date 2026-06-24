import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { PilgrimsPage } from './pages/PilgrimsPage';
import { MawkibOwnersPage } from './pages/MawkibOwnersPage';
import { ProfilePage } from './pages/ProfilePage';
import { MawkibsPage } from './pages/MawkibsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ReservationDetailPage } from './pages/ReservationDetailPage';
import { NewReservationPage } from './pages/NewReservationPage';
import { GuestReservationPage } from './pages/GuestReservationPage';
import { TrackReservationPage } from './pages/TrackReservationPage';
import { GuestMawkibDetailPage } from './pages/GuestMawkibDetailPage';
import { GuestMawkibsPage } from './pages/GuestMawkibsPage';
import { RegisterPage } from './pages/RegisterPage';
import { MawkibOwnerRegisterPage } from './pages/MawkibOwnerRegisterPage';
import { PublicLayout } from './components/guest/PublicLayout';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/guest/reserve" element={<GuestReservationPage />} />
              <Route path="/guest/track" element={<TrackReservationPage />} />
              <Route path="/guest/mawkibs" element={<GuestMawkibsPage />} />
              <Route path="/guest/mawkibs/:id" element={<GuestMawkibDetailPage />} />
              <Route path="/guest/mawkib-owner/register" element={<MawkibOwnerRegisterPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route element={<RoleRoute allowedRoles={['Admin', 'MawkibOwner', 'Pilgrim']} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/reservations" element={<ReservationsPage />} />
                  <Route path="/reservations/:id" element={<ReservationDetailPage />} />
                  <Route path="/mawkibs" element={<MawkibsPage />} />
                  <Route path="/reservations/new" element={<NewReservationPage />} />
                </Route>
                <Route element={<RoleRoute allowedRoles={['Admin', 'MawkibOwner']} />}>
                  <Route path="/users/pilgrims" element={<PilgrimsPage />} />
                </Route>
                <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/users/mawkib-owners" element={<MawkibOwnersPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
