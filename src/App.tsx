import { Suspense, lazy } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrivateRoute } from './utils/PrivateRoute';
import LoginPage from './pages/auth/LoginPage/LoginPage';
import { Layout } from './layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import GestionChambres from './pages/GestionChambres/GestionChambres';
import ProfilPage from './pages/ProfilPage/ProfilPage';
import ConfidentialitePage from './pages/ConfidentialitePage/ConfidentialitePage';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';

const UserListPage = lazy(() => import('./pages/UserListPage/UserListPage'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <PrivateRoute requiredRole="ADMINISTRATEUR">
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="GestionChambres" element={<GestionChambres />} />
              <Route path="users" element={
                <Suspense fallback={<div>Chargement…</div>}>
                  <UserListPage />
                </Suspense>
              } />
              <Route path="profil"          element={<ProfilPage />}          />
              <Route path="confidentialite" element={<ConfidentialitePage />} />
              <Route path="notifications"   element={<NotificationsPage />}   />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
