
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';

export function NotFound() {
  const { t } = useTranslation();
  const location = useLocation();
  
  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-soft dark:bg-primary p-4">
      <div className="card-container p-8 max-w-md text-center">
        <div className="text-6xl font-bold text-accent mb-4">404</div>
        <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
        <p className="text-muted-foreground mb-6">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link to="/" className="btn-primary inline-block">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
