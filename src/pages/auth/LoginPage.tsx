
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

export function LoginPage() {
  const { t } = useTranslation();
  const { isAuthenticated, isClient, isAdmin } = useAuth();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin/clients" replace />;
    } 
    if (isClient) {
      return <Navigate to="/client/chat" replace />;
    }
  }
  
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="card-container p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary dark:text-accent">AUDIT-IA</h1>
          <p className="text-muted-foreground mt-2">
            Plataforma de simulación de equipos de auditoría con agentes de IA jerárquicos
          </p>
        </div>
        
        <h2 className="text-xl font-semibold mb-6 text-center">{t('login.title')}</h2>
        
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
