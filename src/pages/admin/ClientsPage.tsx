
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Client } from '@/types';
import ClientsTable from '@/components/admin/ClientsTable';
import { mockClientApi as clientApi } from '@/api/apiService';
import { toast } from 'sonner';

export function ClientsPage() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await clientApi.getClients();
        
        if (response.success) {
          setClients(response.data);
        } else {
          toast.error(response.message || t('general.error'));
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error(t('general.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, [t]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('admin.clientsTitle')}</h1>
        <p className="text-muted-foreground">
          Lista de clientes y sus estados de auditoría
        </p>
      </div>
      
      <ClientsTable clients={clients} loading={loading} />
    </div>
  );
}

export default ClientsPage;
