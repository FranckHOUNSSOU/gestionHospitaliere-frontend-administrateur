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

const UserListPage = lazy(() => import('./pages/admin/users'));
//const PatientList  = lazy(() => import('./pages/agent/patients/PatientList'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/users"  element={<UserListPage />} />
          
           

            {/* ADMINISTRATEUR */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="ADMINISTRATEUR">
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

            {/* AGENT ADMINISTRATIF */}
            <Route
              path="/agent"
              element={
                <PrivateRoute requiredRole="AGENT_ADMINISTRATIF">
                  <NavigationProvider>          {/* ← enveloppe le layout agent */}
                    <AgentLayout />
                  </NavigationProvider>
                </PrivateRoute>
              }
            >
            <Route path="/agent/patients/PatientList" element={<PatientList />} />
            <Route path="/agent/patients/PatientForm" element={<PatientForm />} />
            <Route path="/agent/admissions/AdmissionList" element={<AdmissionList />} />
            <Route path="/agent/admissions/AdmissionForm" element={<AdmissionForm />} />
            <Route path="/agent/appointments/AppointmentList" element={<AppointmentList />} />
            <Route path="/agent/appointments/AppointmentForm" element={<AppointmentForm />} />
            <Route path="/agent/billing/InvoiceForm" element={<InvoiceForm />} />
            <Route path="/agent/billing/InvoiceList" element={<InvoiceList />} />
            <Route path="/agent/report/Reports" element={<Reports />} />


              <Route index element={<DashboardAgent />} />   {/* ← dashboard agent */}
              <Route path="patients" element={
                <Suspense fallback={<div>Chargement…</div>}>
                  
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