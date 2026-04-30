// src/App.tsx

import { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrivateRoute } from './routes/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import { AdminLayout } from './components/admin/layout/adminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import DashboardAgent from './pages/agent/DashboardAgent';
import { NavigationProvider } from './context/NavigationContext';
import { AgentLayout } from './components/agent/layout/agentLayout';
import AppointmentForm from './pages/agent/appointments/AppointmentForm';
import AppointmentList from './pages/agent/appointments/AppointmentList';
import AdmissionForm from './pages/agent/admissions/AdmissionForm';
import AdmissionList from './pages/agent/admissions/AdmissionList';
import InvoiceForm from './pages/agent/billing/InvoiceForm';
import InvoiceList from './pages/agent/billing/InvoiceList';
import Reports from './pages/agent/reports/Reports';
import PatientForm from './pages/agent/patients/PatientForm';
import PatientList from './pages/agent/patients/PatientList';
import { AgentRLayout } from './components/agentR/layout/agentRLayout';
import AccueilPatient from './pages/agentR/AccueilPatient';
import RechercheDossier from './pages/agentR/RechercheDossier';
import GestionChambres from './pages/admin/GestionChambres';

const UserListPage = lazy(() => import('./pages/admin/users'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* ── ADMINISTRATEUR ───────────────────────── */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="ADMINISTRATEUR">
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="Dashboard" element={<Dashboard />} />
              <Route path="GestionChambres" element={<GestionChambres />} />
              <Route path="users" element={
                <Suspense fallback={<div>Chargement…</div>}>
                  <UserListPage />
                </Suspense>
              } />
            </Route>

            {/* ── AGENT ADMINISTRATIF ──────────────────── */}
            <Route
              path="/agent"
              element={
                <PrivateRoute requiredRole="AGENT_ADMINISTRATIF">
                  <NavigationProvider>
                    <AgentLayout />
                  </NavigationProvider>
                </PrivateRoute>
              }
            >
              <Route index element={<DashboardAgent />} />
              <Route path="DashboardAgent" element={<DashboardAgent />} />
              <Route path="patients/PatientList" element={<PatientList />} />
              <Route path="patients/PatientForm" element={<PatientForm />} />
              <Route path="admissions/AdmissionList" element={<AdmissionList />} />
              <Route path="admissions/AdmissionForm" element={<AdmissionForm />} />
              <Route path="appointments/AppointmentList" element={<AppointmentList />} />
              <Route path="appointments/AppointmentForm" element={<AppointmentForm />} />
              <Route path="billing/InvoiceList" element={<InvoiceList />} />
              <Route path="billing/InvoiceForm" element={<InvoiceForm />} />
              <Route path="reports/Reports" element={<Reports />} />
            </Route>

            {/* ── AGENT DE RENSEIGNEMENT ───────────────── */}
            <Route
              path="/agentR"
              element={
                <PrivateRoute requiredRole="AGENT_RENSEIGNEMENT">
                  <AgentRLayout />
                </PrivateRoute>
              }
            >
             
              <Route index element={<AccueilPatient />} />
              <Route path="AccueilPatient" element={<AccueilPatient />} />
              <Route path="RechercheDossier" element={<RechercheDossier />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;