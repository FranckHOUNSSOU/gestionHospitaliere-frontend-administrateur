import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useTheme } from '../../../context/ThemeContext';
import '../../../pages/admin/Dashboard.css';

export const AdminLayout = () => {
  const { dark } = useTheme();
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="adm" data-theme={dark ? 'dark' : ''}>
      <div className="adm-wrap">
        <Topbar minimized={minimized} onToggleSidebar={() => setMinimized(m => !m)} />
        <div className="adm-body">
          <Sidebar minimized={minimized} />
          <div className="adm-content-col">
            <Outlet />
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};