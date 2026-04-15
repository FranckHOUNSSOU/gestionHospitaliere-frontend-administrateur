import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { useTheme } from '../../../context/ThemeContext';
import '../../../pages/admin/Dashboard.css';

export const AdminLayout = () => {
  const { dark } = useTheme();
  return (
    <div className="adm" data-theme={dark ? 'dark' : ''}>
      <div className="adm-wrap">
        <Topbar />
        <div className="adm-body">
          <Sidebar />
          <Outlet />
        </div>
      </div>
    </div>
  );
};