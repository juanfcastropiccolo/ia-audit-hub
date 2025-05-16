
import { type ReactNode } from 'react';
import ThemeToggle from '../components/common/ThemeToggle';

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo to-purple text-white dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="container mx-auto h-full flex items-center justify-center py-8 px-4">
        {children}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-softYellow/10 blur-3xl"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-lavender/10 blur-3xl"></div>
    </div>
  );
}

export default AuthLayout;
