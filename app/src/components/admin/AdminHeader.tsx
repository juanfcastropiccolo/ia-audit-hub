import { useState, useEffect } from 'react';
import ThemeToggle from '../common/ThemeToggle';

interface User {
  name: string;
  role: string;
}

interface AdminHeaderProps {
  user?: User;
}

function AdminHeader({ user }: AdminHeaderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  useEffect(() => {
    // If user is passed as prop, use it
    if (user) {
      setCurrentUser(user);
      return;
    }
    
    // Otherwise, try to get from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser({
          name: userData.name,
          role: userData.role
        });
      } catch (e) {
        console.error('Failed to parse user data from localStorage:', e);
      }
    }
  }, [user]);
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Panel de Administración</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Auditoría IA</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-4 h-4 text-gray-600 dark:text-gray-400"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                  <a 
                    href="#profile" 
                    className="block px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Mi perfil
                  </a>
                  <a 
                    href="#settings" 
                    className="block px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Configuración
                  </a>
                  <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  <button 
                    onClick={() => {
                      // Handle logout logic here
                      window.location.href = '/login';
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
