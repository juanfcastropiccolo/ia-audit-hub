
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// This page redirects to the appropriate starting point based on auth status
export function Index() {
  const { isAuthenticated, isAdmin, isClient } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (isAdmin) {
    return <Navigate to="/admin/clients" replace />;
  }
  
  if (isClient) {
    return <Navigate to="/client/chat" replace />;
  }
  
  // Fallback (should not happen)
  return <Navigate to="/login" replace />;
}

export default Index;
