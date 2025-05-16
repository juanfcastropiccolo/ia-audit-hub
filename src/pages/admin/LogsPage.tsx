
import { useTranslation } from 'react-i18next';

export function LogsPage() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('nav.logs')}</h1>
        <p className="text-muted-foreground">
          Registros de actividad del sistema
        </p>
      </div>
      
      <div className="card-container p-8 text-center">
        <p className="text-muted-foreground">
          Funcionalidad de registros en construcción
        </p>
      </div>
    </div>
  );
}

export default LogsPage;
