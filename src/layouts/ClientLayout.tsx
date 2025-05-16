
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../components/common/ThemeToggle';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get user info from localStorage
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'Cliente', role: 'Client' };

  const handleLogout = () => {
    // Clear auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-soft-background dark:bg-deep-indigo">
      {/* Header */}
      <header className="bg-primary dark:bg-gray-800 text-white py-3 px-4 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">AUDIT<span className="text-accent">IA</span></h1>
            <div className="hidden sm:block ml-6 px-3 py-1 bg-secondary/30 rounded-full text-sm">
              {user.name}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-accent text-primary rounded hover:bg-accent/80 transition-colors"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ClientLayout;
