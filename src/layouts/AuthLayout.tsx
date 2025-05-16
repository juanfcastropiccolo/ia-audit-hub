
import { Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageSwitch from '@/components/common/LanguageSwitch';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-soft dark:bg-primary">
      <header className="p-4 flex justify-end">
        <div className="flex items-center space-x-2">
          <LanguageSwitch />
          <ThemeToggle />
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
