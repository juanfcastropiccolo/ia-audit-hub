
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  name: string;
  company: string;
  status: string;
  progress: number;
  lastActivity?: Date;
}

function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch clients data from the API
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would be an API call
        // const response = await fetch('/api/clients');
        // const data = await response.json();
        
        // Mock data for demonstration
        setTimeout(() => {
          const mockClients: Client[] = [
            { 
              id: 'client1', 
              name: 'ACME Corporation', 
              company: 'ACME S.A.',
              status: 'En progreso', 
              progress: 65,
              lastActivity: new Date(Date.now() - 3600000) // 1 hour ago
            },
            { 
              id: 'client2', 
              name: 'Tech Industries', 
              company: 'Tech Industries LLC',
              status: 'Completado', 
              progress: 100,
              lastActivity: new Date(Date.now() - 86400000) // 1 day ago
            },
            { 
              id: 'client3', 
              name: 'Global Services', 
              company: 'Global Services Inc.',
              status: 'En revisión', 
              progress: 80,
              lastActivity: new Date(Date.now() - 43200000) // 12 hours ago
            },
            { 
              id: 'client4', 
              name: 'Local Business', 
              company: 'Local Enterprises',
              status: 'Esperando documentos', 
              progress: 30,
              lastActivity: new Date(Date.now() - 172800000) // 2 days ago
            },
          ];
          
          setClients(mockClients);
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching clients:', error);
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const goToClient = (clientId: string) => {
    navigate(`/admin/clients/${clientId}`);
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to render client cards
  const renderClientCards = () => {
    if (filteredClients.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron clientes con esos criterios.</p>
        </div>
      );
    }

    return filteredClients.map(client => (
      <div 
        key={client.id} 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => goToClient(client.id)}
      >
        <h3 className="text-xl font-semibold text-primary dark:text-accent mb-2">{client.name}</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-2">{client.company}</p>
        <p className="text-gray-700 dark:text-gray-300">
          Estado: <span className={`font-medium ${
            client.status === 'Completado' ? 'text-green-600 dark:text-green-400' : 
            client.status === 'En progreso' ? 'text-amber-600 dark:text-amber-400' : 
            client.status === 'En revisión' ? 'text-blue-600 dark:text-blue-400' : 
            'text-gray-600 dark:text-gray-400'
          }`}>{client.status}</span>
        </p>
        <p className="text-gray-700 dark:text-gray-300 mt-4">Progreso de Auditoría:</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1 mb-2 dark:bg-gray-700">
          <div 
            className={`${
              client.progress === 100 ? 'bg-green-500 dark:bg-green-600' : 'bg-accent dark:bg-secondary'
            } h-2 rounded-full`} 
            style={{width: `${client.progress}%`}}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{client.progress}% completado</p>
        {client.lastActivity && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Última actividad: {client.lastActivity.toLocaleDateString('es-ES', {
              day: 'numeric', 
              month: 'long', 
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    ));
  };

  // Loading skeleton
  const renderSkeletonCards = () => {
    return Array(4).fill(null).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-4"></div>
      </div>
    ));
  };

  return (
    <main className="p-6 bg-soft-background min-h-screen dark:bg-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-primary dark:text-white">Clientes</h2>
        
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? renderSkeletonCards() : renderClientCards()}
      </div>
    </main>
  );
}

export default ClientsPage;
