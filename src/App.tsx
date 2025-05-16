
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import AuthLayout from './layouts/AuthLayout';
import ClientsPage from './views/admin/ClientsPage';
import LogsPage from './views/admin/LogsPage';
import ChatPage from './views/client/ChatPage';
import LoginPage from './views/auth/LoginPage';
import { isAuthenticated as checkIsAuthenticated, getUser } from './api/auth';
import './App.css';

// Define a more specific type for user roles
type UserRole = 'admin' | 'client';

// RequireAuth component to protect routes
function RequireAuth({ children, allowedRole }: { children: JSX.Element, allowedRole: UserRole | null }) {
  const authStatus = checkIsAuthenticated();
  const user = getUser();
  const userRole = user?.role as UserRole | undefined;
  
  if (!authStatus) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && userRole !== allowedRole) {
    // Not authorized for this role, redirect to appropriate section
    return <Navigate to={userRole === 'admin' ? '/admin/clients' : '/chat'} replace />;
  }
  
  // Authenticated and authorized
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status when app loads
  useEffect(() => {
    const authStatus = checkAuth();
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      const user = getUser();
      if (user) {
        setUserRole(user.role as UserRole);
      }
    }
    
    setLoading(false);
  }, []);

  // Authentication helper
  const checkAuth = () => {
    return checkIsAuthenticated();
  };

  const handleLoginSuccess = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen dark:bg-gray-900">
        <Routes>
          {/* Login route (accessible to all) */}
          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to={userRole === 'admin' ? '/admin/clients' : '/chat'} />
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
                <ChatPage />
              </ClientLayout>
            </RequireAuth>
          } />
          
          {/* Default redirect based on auth status and role */}
          <Route path="/" element={
            <Navigate to={isAuthenticated 
              ? (userRole === 'admin' ? '/admin/clients' : '/chat') 
              : '/login'} 
            />
          } />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">Página no encontrada</h1>
              <p className="text-gray-600 mb-8 dark:text-gray-300">Lo sentimos, la página que busca no existe.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-accent text-primary rounded-lg hover:bg-accent/80"
              >
                Volver al inicio
              </button>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
