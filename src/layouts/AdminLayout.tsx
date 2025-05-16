import { type ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-primary dark:bg-gray-800 text-white">
        <div className="p-4 text-xl font-semibold">AUDIT-IA</div>
        <nav className="mt-6">
          <div 
            className="py-3 px-6 hover:bg-primary/80 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => navigate('/admin/clients')}
          >
            {t('clients')}
          </div>
          <div 
            className="py-3 px-6 hover:bg-primary/80 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => navigate('/admin/logs')}
          >
            {t('logs')}
          </div>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button 
            onClick={handleLogout}
            className="w-full py-2 text-center bg-accent text-primary rounded hover:bg-accent/80"
          >
            {t('logout')}
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
