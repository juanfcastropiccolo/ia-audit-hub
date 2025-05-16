
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageSwitch from '@/components/common/LanguageSwitch';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { Users, FileText, LogOut, Menu, X } from 'lucide-react';

export function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  
  // Navigation items
  const navItems = [
    {
      name: t('nav.clients'),
      path: '/admin/clients',
      icon: <Users className="h-5 w-5" />
    },
    {
      name: t('nav.logs'),
      path: '/admin/logs',
      icon: <FileText className="h-5 w-5" />
    }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Connection status banner */}
      <ConnectionStatus />
      
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-2 px-4 shadow-md z-20">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
              aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-bold text-xl">AUDIT-IA</span>
            <span className="text-sm bg-primary-foreground/10 px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm mr-4 hidden sm:inline-block">
              {user?.name}
            </span>
            <LanguageSwitch />
            <ThemeToggle />
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Sidebar and Main Content */}
      <div className="flex flex-1 relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-30"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar */}
        <aside 
          className={`bg-secondary text-secondary-foreground w-64 shadow-lg fixed lg:relative z-40 h-[calc(100vh-56px)] transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Mobile close button */}
          <button
            className="lg:hidden absolute top-2 right-2 p-2 rounded-full hover:bg-secondary-foreground/10 transition-colors"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Nav items */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
                onClick={closeSidebar}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
