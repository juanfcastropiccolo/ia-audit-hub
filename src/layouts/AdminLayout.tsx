
import { ReactNode, useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../components/common/ThemeToggle';

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Get user info from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Admin', role: 'Administrator' };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-deep-indigo">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-primary dark:bg-gray-800 text-white transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-20`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary/20 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="text-xl font-bold">
              AUDIT<span className="text-accent">IA</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-primary/20 dark:hover:bg-gray-700 focus:outline-none"
          >
            {sidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        <nav className="mt-6 px-2">
          <Link
            to="/admin/clients"
            className="flex items-center px-4 py-3 mb-2 rounded-lg hover:bg-secondary/50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            {!sidebarCollapsed && <span className="ml-3">{t('clients')}</span>}
          </Link>
          
          <Link
            to="/admin/logs"
            className="flex items-center px-4 py-3 mb-2 rounded-lg hover:bg-secondary/50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
              <polyline strokeLinecap="round" strokeLinejoin="round" points="13 2 13 9 20 9"></polyline>
            </svg>
            {!sidebarCollapsed && <span className="ml-3">{t('logs')}</span>}
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-primary/20 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
            {!sidebarCollapsed && (
              <div className="text-sm text-gray-300">{user.name}</div>
            )}
          </div>
          
          <button 
            onClick={handleLogout}
            className={`w-full py-2 text-center bg-accent text-primary rounded hover:bg-accent/80 transition-colors ${
              sidebarCollapsed ? 'px-2' : 'px-4'
            }`}
          >
            {sidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 7l-5 5 5 5M7 17V7"></path>
              </svg>
            ) : (
              t('logout')
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-primary dark:text-white">
              {t('admin_dashboard')}
            </h1>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {user.name} - {user.role}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
