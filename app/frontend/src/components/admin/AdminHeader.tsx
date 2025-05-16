import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';

interface User {
  name: string;
  role: string;
}

interface AdminHeaderProps {
  user: User;
}

function AdminHeader({ user }: AdminHeaderProps) {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    // Use our auth service to log out
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    // Toggle dark mode by adding/removing the 'dark' class to document.documentElement (html)
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b dark:bg-gray-800 dark:border-gray-700"> 
      <div>
        <h1 className="text-xl font-semibold text-deepIndigo dark:text-gray-100">Panel de Auditoría IA</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Bienvenido, {user?.name} ({user?.role})</p>
      </div>
      <div className="flex items-center space-x-4">
        {/* Toggle claro/oscuro */}
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDarkMode ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-yellow-400" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 text-deepIndigo" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
        {/* Botón logout */}
        <button 
          onClick={handleLogout} 
          className="bg-purpleTint text-white px-4 py-2 rounded-2xl shadow hover:bg-purple-700 dark:bg-deepIndigo dark:hover:bg-indigo-900"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default AdminHeader; 