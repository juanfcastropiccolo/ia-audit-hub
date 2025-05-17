import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import AuthLayout from './layouts/AuthLayout';
import ClientsPage from './views/admin/ClientsPage';
import LogsPage from './views/admin/LogsPage';
import ChatPage from './views/client/ChatPage';
import LoginPage from './views/auth/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import './App.css';

// Define a more specific type for user roles
type UserRole = 'admin' | 'client';

// RequireAuth component to protect routes
function RequireAuth({ children, allowedRole }: { children: JSX.Element, allowedRole: UserRole | null }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Get stored user role from localStorage
  const getUserRole = (): UserRole | undefined => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed.role as UserRole;
      } catch (e) {
        console.error("Failed to parse user role from localStorage", e);
        return undefined;
      }
    }
    return undefined;
  };

  const userRole = getUserRole();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user || !userRole) {
    // Not authenticated or no role, redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Not authorized for this role, redirect to appropriate section
    return <Navigate to={userRole === 'admin' ? '/admin/clients' : '/chat'} replace />;
  }

  // Authenticated and authorized
  return children;
}

function AppRoutes() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { user, loading } = useAuth();

  // Limpia localStorage si la sesión de Supabase no es válida
  useEffect(() => {
    // Debugging redirection issue
    console.log("Auth state:", { user, userRole });

    if (!user) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUserRole(null);
    }
  }, [user]);

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
  };

  // Initialize userRole from localStorage only if we have a valid user
  useEffect(() => {
    if (user) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role) {
            setUserRole(parsed.role as UserRole);
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Routes>
      {/* Login route (accessible to all) */}
      <Route path="/login" element={
        user && userRole ? (
          <Navigate to={userRole === 'admin' ? '/admin/clients' : '/chat'} replace />
        ) : (
          <AuthLayout>
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          </AuthLayout>
        )
      } />
      
      {/* Admin routes (require admin role) */}
      <Route path="/admin" element={
        <RequireAuth allowedRole="admin">
          <AdminLayout />
        </RequireAuth>
      }>
        <Route index element={<Navigate to="clients" />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="logs" element={<LogsPage />} />
      </Route>
      
      {/* Client chat route (requires client role) */}
      <Route path="/chat" element={
        <RequireAuth allowedRole="client">
          <ClientLayout>
            <ChatProvider>
              <ChatPage />
            </ChatProvider>
          </ClientLayout>
        </RequireAuth>
      } />
      
      {/* Default redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch-all route for 404 redirects to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
