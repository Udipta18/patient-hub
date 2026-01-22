import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Providers } from './providers';
import { ProtectedRoute } from './protected-route';
import { AppLayout } from '@/components/common/AppLayout';
import { LoginPage } from '@/pages/login/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PatientListPage } from '@/pages/patients/PatientListPage';
import { PatientDetailPage } from '@/pages/patients/PatientDetailPage';
import { PrescriptionsListPage } from '@/pages/prescriptions/PrescriptionsListPage';
import { NewPrescriptionPage } from '@/pages/prescriptions/NewPrescriptionPage';
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
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/prescriptions" element={<PrescriptionsListPage />} />
            <Route path="/prescriptions/new" element={<NewPrescriptionPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
