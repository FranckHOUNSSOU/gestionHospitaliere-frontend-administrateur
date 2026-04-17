import { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrivateRoute } from './routes/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import { AdminLayout } from './components/admin/layout/adminLayout';
import { Dashboard } from './pages/admin/Dashboard';
{/*
import {Footer} from './components/agent/layout/Layout';
import DashboardAgent from './pages/agent/DashboardAgent';
import PatientForm from './pages/agent/patients/PatientForm';
import PatientDetail from './pages/agent/patients/PatientDetail';
import AdmissionList from './pages/agent/admissions/AdmissionList';
import AdmissionForm from './pages/agent/admissions/AdmissionForm';
import AppointmentList from './pages/agent/appointments/AppointmentList';
import AppointmentForm from './pages/agent/appointments/AppointmentForm';
import InvoiceList from './pages/agent/billing/InvoiceList';
import InvoiceForm from './pages/agent/billing/InvoiceForm';
import InvoiceDetail from './pages/agent/billing/InvoiceDetail';
import Reports from './pages/agent/reports/Reports';
*/}

const UserListPage = lazy(() => import('./pages/admin/users'));
const PatientList = lazy(() => import('./pages/agent/patients/PatientList'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
             <Route path="/users" element={<UserListPage />} />
            <Route path="/indexs" element={<PatientList />} />
{/* ADMINISTRATEUR*/ }
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="ADMINISTRATEUR"> {/* ← maj */}
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={
                <Suspense fallback={<div>Chargement…</div>}>
                  <UserListPage />
                </Suspense>
              } />
            </Route>

{/* AGENT ADMINISTRATIF*/ }
            <Route
              path="/agent"
              element={
                <PrivateRoute requiredRole="AGENT_ADMINISTRATIF"> {/* ← maj */}
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard/>} />
              <Route path="users" element={
                <Suspense fallback={<div>Chargement…</div>}>
                  <PatientList />
                </Suspense>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;