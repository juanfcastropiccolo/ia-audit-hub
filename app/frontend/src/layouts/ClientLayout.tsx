
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth data and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-soft-background dark:bg-gray-900">
      {/* Header */}
      <header className="bg-primary dark:bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">AUDIT-IA</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-accent text-primary rounded hover:bg-accent/80"
        >
          {t('logout')}
        </button>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ClientLayout;
