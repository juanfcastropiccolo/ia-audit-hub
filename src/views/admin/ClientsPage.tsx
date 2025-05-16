
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Client {
  id: number;
  name: string;
  email: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  progress?: number;
}

const ClientsPage: React.FC = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  // Mock clients data
  useEffect(() => {
    // Simulate API call
    const fetchClients = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockClients: Client[] = [
          { 
            id: 1, 
            name: 'Empresa A', 
            email: 'contacto@empresaa.com', 
            lastActive: '2025-05-15', 
            status: 'active',
            progress: 65
          },
          { 
            id: 2, 
            name: 'Empresa B', 
            email: 'info@empresab.com', 
            lastActive: '2025-05-14', 
            status: 'inactive',
            progress: 30
          },
          { 
            id: 3, 
            name: 'Empresa C', 
            email: 'soporte@empresac.com', 
            lastActive: '2025-05-10', 
            status: 'active',
            progress: 90
          },
          { 
            id: 4, 
            name: 'Empresa D', 
            email: 'info@empresad.com', 
            lastActive: '2025-05-08', 
            status: 'pending',
            progress: 10
          },
          { 
            id: 5, 
            name: 'Empresa E', 
            email: 'contacto@empresae.com', 
            lastActive: '2025-05-05', 
            status: 'active',
            progress: 100
          }
        ];
        
        setClients(mockClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filter clients based on search term
  useEffect(() => {
    const results = clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(results);
  }, [clients, searchTerm]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0 text-primary dark:text-white">{t('clients')}</h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg 
              className="w-5 h-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input 
            type="text" 
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-accent w-full md:w-auto"
          />
        </div>
      </div>
      
      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded-full w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Cards (Mobile View) */}
      <div className="md:hidden space-y-4">
        {!loading && filteredClients.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <svg 
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No se encontraron clientes</p>
          </div>
        )}

        {!loading && filteredClients.map(client => (
          <div key={client.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-primary dark:text-white">{client.name}</h3>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(client.status)}`}>
                {getStatusText(client.status)}
              </span>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">{client.email}</div>
            
            {client.progress !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-gray-700 dark:text-gray-300">Progreso</span>
                  <span className="text-gray-700 dark:text-gray-300">{client.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className={`h-2 rounded-full ${
                      client.progress === 100 ? 'bg-green-500' : 'bg-accent'
                    }`} 
                    style={{width: `${client.progress}%`}}
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Última actividad: {client.lastActive}
              </div>
              <button className="text-accent hover:text-accent/80">
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Client Table (Desktop View) */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {!loading && filteredClients.length === 0 ? (
            <div className="p-8 text-center">
              <svg 
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron clientes</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Última actividad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {!loading && filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {client.progress !== undefined ? (
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2 dark:bg-gray-700 max-w-[100px]">
                            <div 
                              className={`h-2 rounded-full ${
                                client.progress === 100 ? 'bg-green-500' : 'bg-accent'
                              }`} 
                              style={{width: `${client.progress}%`}}
                            />
                          </div>
                          <span>{client.progress}%</span>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {client.lastActive}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(client.status)}`}>
                        {getStatusText(client.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-accent hover:text-accent/80">
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
