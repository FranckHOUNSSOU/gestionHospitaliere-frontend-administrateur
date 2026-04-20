import { Outlet } from 'react-router-dom';
import { Topbar } from '../../agent/layout/Topbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Layout';
import { useTheme } from '../../../context/ThemeContext';
//import '../../../pages/agent/Dashboard.css';

export const AgentLayout = () => {
  const { dark } = useTheme();
  return (
    <div className="adm" data-theme={dark ? 'dark' : ''}>
      <div className="adm-wrap">
        <Topbar />
        <div className="adm-body">
          <Sidebar />
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};