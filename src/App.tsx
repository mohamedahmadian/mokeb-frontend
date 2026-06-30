import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleGate } from './components/RoleGate';
import { RoleRoute } from './components/RoleRoute';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { PilgrimsPage } from './pages/PilgrimsPage';
import { MawkibOwnersPage } from './pages/MawkibOwnersPage';
import { HonoraryServantsPage } from './pages/HonoraryServantsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { MawkibsPage } from './pages/MawkibsPage';
import { MawkibMapSearchPage } from './pages/MawkibMapSearchPage';
import { MawkibViewDetailPage } from './pages/MawkibViewDetailPage';
import { MawkibRulesPrintPage } from './pages/MawkibRulesPrintPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ReservationDetailPage } from './pages/ReservationDetailPage';
import { NewReservationPage } from './pages/NewReservationPage';
import { GuestReservationPage } from './pages/GuestReservationPage';
import { TrackReservationPage } from './pages/TrackReservationPage';
import { GuestMawkibDetailPage } from './pages/GuestMawkibDetailPage';
import { GuestMawkibsPage } from './pages/GuestMawkibsPage';
import { RegisterPage } from './pages/RegisterPage';
import { MawkibOwnerRegisterPage } from './pages/MawkibOwnerRegisterPage';
import { HonoraryVolunteerRegisterPage } from './pages/HonoraryVolunteerRegisterPage';
import { HonoraryVolunteerSuccessPage } from './pages/HonoraryVolunteerSuccessPage';
import { HonoraryVolunteerNeedsPage } from './pages/HonoraryVolunteerNeedsPage';
import { HonoraryVolunteerTrackPage } from './pages/HonoraryVolunteerTrackPage';
import { HonoraryVolunteerApplicationsPage } from './pages/HonoraryVolunteerApplicationsPage';
import { MyHonoraryVolunteerApplicationsPage } from './pages/MyHonoraryVolunteerApplicationsPage';
import { MawkibNeedRegisterPage } from './pages/MawkibNeedRegisterPage';
import { OwnerFeedbackInboxPage } from './pages/OwnerFeedbackInboxPage';
import { AdminFeedbackPage } from './pages/AdminFeedbackPage';
import { FeedbackListPage } from './pages/FeedbackListPage';
import { NewFeedbackPage } from './pages/NewFeedbackPage';
import { EditFeedbackPage } from './pages/EditFeedbackPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { MawkibRegistrationGuidePage } from './pages/MawkibRegistrationGuidePage';
import { PilgrimReservationGuidePage } from './pages/PilgrimReservationGuidePage';
import { PilgrimPortalPage } from './pages/PilgrimPortalPage';
import { MawkibOwnerPortalPage } from './pages/MawkibOwnerPortalPage';
import { HonoraryPortalPage } from './pages/HonoraryPortalPage';
import { PublicLayout } from './components/guest/PublicLayout';
import { AppToaster } from './components/ui/AppToaster';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppToaster />
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/guest/reserve" element={<GuestReservationPage />} />
              <Route path="/guest/reserve/guide" element={<PilgrimReservationGuidePage />} />
              <Route path="/guest/track" element={<TrackReservationPage />} />
              <Route path="/guest/mawkibs" element={<GuestMawkibsPage />} />
              <Route path="/guest/mawkibs/:id" element={<GuestMawkibDetailPage />} />
              <Route path="/guest/mawkib-owner/register" element={<MawkibOwnerRegisterPage />} />
              <Route path="/guest/mawkib-owner/guide" element={<MawkibRegistrationGuidePage />} />
              <Route path="/guest/honorary-volunteer" element={<Navigate to="/guest/honorary-volunteer/register" replace />} />
              <Route path="/guest/honorary-volunteer/register" element={<HonoraryVolunteerRegisterPage />} />
              <Route path="/guest/honorary-volunteer/success" element={<HonoraryVolunteerSuccessPage />} />
              <Route path="/guest/honorary-volunteer/needs" element={<HonoraryVolunteerNeedsPage />} />
              <Route path="/guest/honorary-volunteer/track" element={<HonoraryVolunteerTrackPage />} />
              <Route path="/guest/pilgrims" element={<PilgrimPortalPage />} />
              <Route path="/guest/mawkib-owners" element={<MawkibOwnerPortalPage />} />
              <Route path="/guest/honorary" element={<HonoraryPortalPage />} />
              <Route path="/guest/about" element={<AboutPage />} />
              <Route path="/guest/contact" element={<ContactPage />} />
              <Route path="/guest/faq" element={<FaqPage />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route
                  path="/feedback/admin"
                  element={
                    <RoleGate allowedRoles={['Admin']}>
                      <AdminFeedbackPage />
                    </RoleGate>
                  }
                />
                <Route element={<RoleRoute allowedRoles={['Admin', 'MawkibOwner', 'Pilgrim', 'HonoraryServant']} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings/password" element={<ChangePasswordPage />} />
                  <Route path="/mawkibs/map" element={<MawkibMapSearchPage />} />
                  <Route path="/mawkibs/:id/rules" element={<MawkibRulesPrintPage />} />
                  <Route path="/mawkibs/:id/view" element={<MawkibViewDetailPage />} />
                  <Route
                    path="/honorary-volunteers/my"
                    element={<MyHonoraryVolunteerApplicationsPage />}
                  />
                </Route>
                <Route element={<RoleRoute allowedRoles={['Admin', 'MawkibOwner', 'Pilgrim']} />}>
                  <Route path="/reservations" element={<ReservationsPage />} />
                  <Route path="/reservations/:id" element={<ReservationDetailPage />} />
                  <Route path="/mawkibs" element={<MawkibsPage />} />
                  <Route path="/reservations/new" element={<NewReservationPage />} />
                </Route>
                <Route element={<RoleRoute allowedRoles={['Pilgrim']} />}>
                  <Route path="/feedback/new" element={<NewFeedbackPage />} />
                  <Route path="/feedback/:id/edit" element={<EditFeedbackPage />} />
                  <Route path="/feedback" element={<FeedbackListPage />} />
                </Route>
                <Route element={<RoleRoute allowedRoles={['MawkibOwner']} />}>
                  <Route path="/feedback/inbox" element={<OwnerFeedbackInboxPage />} />
                </Route>
                <Route element={<RoleRoute allowedRoles={['Admin']} />}>
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/users/mawkib-owners" element={<MawkibOwnersPage />} />
                  <Route path="/users/honorary-servants" element={<HonoraryServantsPage />} />
                </Route>
                <Route element={<RoleRoute allowedRoles={['Admin', 'MawkibOwner']} />}>
                  <Route path="/users/pilgrims" element={<PilgrimsPage />} />
                  <Route
                    path="/honorary-volunteers"
                    element={<HonoraryVolunteerApplicationsPage />}
                  />
                  <Route path="/honorary-volunteers/new" element={<MawkibNeedRegisterPage />} />
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
