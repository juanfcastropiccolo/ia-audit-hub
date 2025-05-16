import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import ClientsPage from './components/admin/ClientsPage';
import ClientDetailPage from './components/admin/ClientDetailPage';
import LogsPage from './components/admin/LogsPage';
import ChatPage from './components/client/ChatPage';
import LoginPage from './components/LoginPage';
import { isAuthenticated as checkAuth, getUser, logout as performLogout } from './api/auth';
import './App.css'
import ChatInterface from './components/ChatInterface'
import Dashboard from './components/Dashboard'

// Define a more specific type for user roles
type UserRole = 'admin' | 'client';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

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
  }, []);

  const handleLoginSuccess = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
    // Navigation will be handled by the Route's element logic re-evaluating
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen dark:bg-gray-900">
        <Routes>
          {/* Login route (accessible to all) */}
          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to={userRole === 'admin' ? '/admin/clients' : '/chat'} />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          } />
          
          {/* Admin routes (require admin role) */}
          <Route path="/admin" element={
            isAuthenticated && userRole === 'admin' ? (
              <AdminLayout />
            ) : (
              <Navigate to="/login" />
            )
          }>
            <Route index element={<Navigate to="clients" />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:clientId" element={<ClientDetailPage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
          
          {/* Client chat route (requires authentication) */}
          <Route path="/chat" element={
            isAuthenticated && userRole === 'client' ? (
              <ChatPage />
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to={isAuthenticated ? (userRole === 'admin' ? '/admin/clients' : '/chat') : '/login'} />} />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
              <h1 className="text-4xl font-bold text-deepIndigo mb-4">Página no encontrada</h1>
              <p className="text-gray-600 mb-8">Lo sentimos, la página que busca no existe.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-purpleTint text-white rounded-lg hover:bg-deepIndigo"
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
