import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
  status: string;
  progress: number;
  lastActivity?: Date;
}

function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch clients data from the API
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/clients');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
        // In a real app, you might want to show an error toast or message
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // For this example, let's create some mock data if the API call doesn't return anything
  useEffect(() => {
    if (!isLoading && clients.length === 0) {
      // Mock data for demonstration
      setClients([
        { id: 'client1', name: 'ACME Corporation', status: 'En progreso', progress: 65 },
        { id: 'client2', name: 'Tech Industries', status: 'Completado', progress: 100 },
        { id: 'client3', name: 'Global Services', status: 'En revisión', progress: 80 },
        { id: 'client4', name: 'Local Business', status: 'Esperando documentos', progress: 30 },
      ]);
    }
  }, [isLoading, clients]);

  const goToClient = (clientId: string) => {
    navigate(`/admin/clients/${clientId}`);
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
      <h2 className="text-2xl font-bold text-deepIndigo mb-6 dark:text-white">Clientes</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deepIndigo"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map(client => (
            <div 
              key={client.id} 
              className="rounded-2xl shadow-md bg-white p-5 cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:text-white" 
              onClick={() => goToClient(client.id)}
            >
              <h3 className="text-xl font-semibold text-deepIndigo mb-2 dark:text-purpleTint">{client.name}</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Estado: <span className={`font-medium ${
                  client.status === 'Completado' ? 'text-green-600 dark:text-green-400' : 
                  client.status === 'En progreso' ? 'text-amber-600 dark:text-amber-400' : 
                  client.status === 'En revisión' ? 'text-blue-600 dark:text-blue-400' : 
                  'text-gray-600 dark:text-gray-400'
                }`}>{client.status}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-2">Progreso de Auditoría:</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1 mb-2 dark:bg-gray-700">
                <div 
                  className={`${
                    client.progress === 100 ? 'bg-green-500 dark:bg-green-600' : 'bg-purpleTint dark:bg-deepIndigo'
                  } h-2 rounded-full`} 
                  style={{width: `${client.progress}%`}}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{client.progress}% completado</p>
              {client.lastActivity && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  Última actividad: {client.lastActivity.toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default ClientsPage; 