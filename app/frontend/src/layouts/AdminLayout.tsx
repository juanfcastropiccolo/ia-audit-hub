
import { ReactNode, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

interface AdminLayoutProps {
  children?: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Listen to custom event emitted by sidebar when it collapses/expands
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };
    
    window.addEventListener('sidebarToggle' as any, handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle' as any, handleSidebarToggle as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-soft-background dark:bg-gray-900 flex">
      <AdminSidebar />
      <div className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 ease-in-out`}>
        <AdminHeader />
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
