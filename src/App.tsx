import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrivateRoute } from './routes/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import { AdminLayout } from './components/admin/layout/adminLayout';
import { Dashboard } from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="ADMINISTRATEUR"> {/* ← maj */}
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;