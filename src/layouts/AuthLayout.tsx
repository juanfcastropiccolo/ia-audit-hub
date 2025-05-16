
import React from 'react';
import ThemeToggle from '../components/common/ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-soft-background dark:bg-deep-indigo">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex-grow flex items-center justify-center px-4">
        {children}
      </div>
      <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} AUDIT-IA. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default AuthLayout;
