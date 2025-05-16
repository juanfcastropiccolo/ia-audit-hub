
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';
import ThemeToggle from '../common/ThemeToggle';

interface ClientHeaderProps {
  userName?: string;
}

function ClientHeader({ userName = 'Cliente' }: ClientHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">
            Auditoría<span className="text-accent">IA</span>
          </h1>
        </div>
        
        <div className="flex items-center">
          <ThemeToggle />
          
          <div className="relative ml-4">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2 text-white hover:text-accent"
            >
              <span>{userName}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-4 h-4"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default ClientHeader;
