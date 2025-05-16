
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageSwitch from '@/components/common/LanguageSwitch';
import ConnectionStatus from '@/components/common/ConnectionStatus';
import { LogOut } from 'lucide-react';
import { ChatProvider } from '@/contexts/ChatContext';

export function ClientLayout() {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Connection status banner */}
      <ConnectionStatus />
      
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-2 px-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl">AUDIT-IA</span>
            <span className="text-sm bg-primary-foreground/10 px-2 py-0.5 rounded">
              Cliente
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm mr-4">
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
      
      {/* Main content */}
      <ChatProvider>
        <main className="flex-1 container mx-auto px-4 py-6">
          <Outlet />
        </main>
      </ChatProvider>
    </div>
  );
}

export default ClientLayout;
