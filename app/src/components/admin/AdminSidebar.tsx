
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';
import ThemeToggle from '../common/ThemeToggle';

function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`fixed inset-y-0 left-0 ${collapsed ? 'w-16' : 'w-64'} bg-primary text-gray-100 flex flex-col transition-all duration-300 ease-in-out z-10`}>
      <div className="px-4 py-5 flex items-center justify-between border-b border-primary-700">
        {!collapsed && (
          <div className="font-bold text-xl">
            Auditoría<span className="text-accent">IA</span>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-6 h-6"
          >
            {collapsed ? (
              <polyline points="13 17 18 12 13 7"></polyline>
            ) : (
              <polyline points="11 17 6 12 11 7"></polyline>
            )}
          </svg>
        </button>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavLink 
          to="/admin/clients" 
          className={({ isActive }) => 
            `flex items-center p-2 rounded-lg hover:bg-secondary ${isActive ? "bg-secondary" : ""}`
          }
          title="Clientes"
        >
          <svg 
            className="w-6 h-6 mr-3" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          {!collapsed && "Clientes"}
        </NavLink>
        
        <NavLink 
          to="/admin/logs" 
          className={({ isActive }) => 
            `flex items-center p-2 rounded-lg hover:bg-secondary ${isActive ? "bg-secondary" : ""}`
          }
          title="Logs"
        >
          <svg 
            className="w-6 h-6 mr-3" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          {!collapsed && "Logs"}
        </NavLink>
      </nav>
      
      <div className="px-4 py-3 border-t border-primary-700 flex items-center justify-between">
        <ThemeToggle />
        <button 
          onClick={handleLogout}
          className="flex items-center p-2 rounded-md hover:bg-secondary"
          title="Cerrar sesión"
        >
          <svg 
            className="w-6 h-6" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          {!collapsed && <span className="ml-3">Salir</span>}
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
