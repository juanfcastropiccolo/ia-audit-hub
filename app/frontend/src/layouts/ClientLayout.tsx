
import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import ClientHeader from '../components/client/ClientHeader';

interface ClientLayoutProps {
  children?: ReactNode;
}

function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-soft-background dark:bg-gray-900 flex flex-col">
      <ClientHeader />
      <main className="flex-1 overflow-hidden">
        {children || <Outlet />}
      </main>
    </div>
  );
}

export default ClientLayout;
