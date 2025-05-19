
import { type ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

interface AdminLayoutProps {
  children?: ReactNode;
}

function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // User info
  const user = {
    name: 'Admin User',
    role: 'Administrator'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      {/* Mobile overlay menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64">
            <AdminSidebar />
          </div>
        </div>
      )}
      <div className="flex-1 md:ml-64">
        <AdminHeader user={user} onToggleMobileMenu={() => setMobileMenuOpen(open => !open)} />
        <main>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
