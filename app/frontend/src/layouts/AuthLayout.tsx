
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-row bg-soft-background dark:bg-gray-900">
      {/* Left sidebar - Brand area */}
      <div className="hidden md:flex w-1/3 bg-primary flex-col justify-between">
        <div className="px-8 pt-12">
          <h1 className="text-4xl font-bold text-white">
            Auditoría<span className="text-accent">IA</span>
          </h1>
          <p className="mt-4 text-secondary text-lg">
            Plataforma inteligente de auditoría
          </p>
          <div className="mt-8 h-1 w-16 bg-accent rounded"></div>
        </div>
        <div className="p-8">
          <p className="text-secondary text-sm">
            © 2025 AuditoríaIA. Todos los derechos reservados.
          </p>
        </div>
      </div>
      
      {/* Right side - Content */}
      <div className="w-full md:w-2/3 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
