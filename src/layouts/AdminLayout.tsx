
import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

interface AdminLayoutProps {
  children?: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  // Mock user for demonstration
  const user = {
    name: 'Admin User',
    role: 'Administrator'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64"> {/* Space for sidebar */}
        <AdminHeader user={user} />
        <main>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
