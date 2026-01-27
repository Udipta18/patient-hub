import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Providers } from './providers';
import { ProtectedRoute } from './protected-route';
import { AppLayout } from '@/components/common/AppLayout';
import { LoginPage } from '@/pages/login/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PatientListPage } from '@/pages/patients/PatientListPage';
import { NewPatientPage } from '@/pages/patients/NewPatientPage';
import { PatientDetailPage } from '@/pages/patients/PatientDetailPage';
import { PrescriptionsListPage } from '@/pages/prescriptions/PrescriptionsListPage';
import { NewPrescriptionPage } from '@/pages/prescriptions/NewPrescriptionPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import NotFound from '@/pages/NotFound';


export function AppRouter() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/patients/new" element={<NewPatientPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/prescriptions" element={<PrescriptionsListPage />} />
            <Route path="/prescriptions/new" element={<NewPrescriptionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
