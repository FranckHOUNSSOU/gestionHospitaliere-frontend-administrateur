import { Outlet } from 'react-router-dom';
import { Topbar } from '../../../components/agentR/layout/Topbar';
import { SideBar } from './SideBar';
import { useTheme } from '../../../context/ThemeContext';
import { DoctorProvider } from '../../../context/DoctorContext';
import '../../../pages/admin/Dashboard.css';
import { Footer } from './Footer';
import { useState } from 'react';

export const AgentRLayout = () => {
  const { dark } = useTheme();
  const [minimized, setMinimized] = useState(false);
  return (
    <div
      className="adm"
      data-theme={dark ? 'dark' : ''}
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      <div className="adm-wrap">
        <Topbar minimized={minimized} onToggleSidebar={() => setMinimized(m => !m)} />
        <div className="adm-body">
           <SideBar minimized={minimized} />
          <DoctorProvider>
            <div
              className="adm-content-col"
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
            >
              <div
                className="adm-main"
                style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
              >
                <Outlet />
              </div>
              <Footer />
            </div>
          </DoctorProvider>
        </div>
      </div>
    </div>
  );
};