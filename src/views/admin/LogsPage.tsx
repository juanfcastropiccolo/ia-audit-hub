
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Log {
  id: number;
  timestamp: string;
  client: string;
  event: string;
  details: string;
  eventType: 'info' | 'warning' | 'error' | 'success';
}

const LogsPage: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  
  // Mock logs data
  useEffect(() => {
    // Simulate API call
    const fetchLogs = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockLogs: Log[] = [
          { 
            id: 1, 
            timestamp: '2025-05-15 14:30:22', 
            client: 'Empresa A', 
            event: 'Archivo subido', 
            details: 'financial_report_2025.xlsx',
            eventType: 'info'
          },
          { 
            id: 2, 
            timestamp: '2025-05-15 14:29:45', 
            client: 'Empresa A', 
            event: 'Respuesta del asistente', 
            details: 'Respondió a consulta sobre discrepancias financieras',
            eventType: 'success'
          },
          { 
            id: 3, 
            timestamp: '2025-05-15 14:28:10', 
            client: 'Empresa A', 
            event: 'Consulta del usuario', 
            details: 'Preguntó sobre posibles discrepancias financieras',
            eventType: 'info'
          },
          { 
            id: 4, 
            timestamp: '2025-05-15 13:45:22', 
            client: 'Empresa B', 
            event: 'Sesión iniciada', 
            details: 'Nueva sesión de auditoría iniciada',
            eventType: 'info'
          },
          { 
            id: 5, 
            timestamp: '2025-05-14 10:15:33', 
            client: 'Empresa C', 
            event: 'Error de procesamiento', 
            details: 'No se pudo procesar el archivo debido a formato incompatible',
            eventType: 'error'
          },
          { 
            id: 6, 
            timestamp: '2025-05-13 16:42:18', 
            client: 'Empresa B', 
            event: 'Advertencia de auditoría', 
            details: 'Se detectaron posibles irregularidades en las transacciones',
            eventType: 'warning'
          },
        ];
        
        setLogs(mockLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on search term and date
  useEffect(() => {
    let results = logs;
    
    // Filter by search term
    if (searchTerm) {
      results = results.filter(log => 
        log.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by date
    if (dateFilter) {
      results = results.filter(log => 
        log.timestamp.startsWith(dateFilter)
      );
    }
    
    setFilteredLogs(results);
  }, [logs, searchTerm, dateFilter]);

  const getEventTypeClass = (eventType: string) => {
    switch (eventType) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0 text-primary dark:text-white">{t('logs')}</h1>
      </div>
      
      {/* Search/filter inputs */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
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
                      focus:outline-none focus:ring-2 focus:ring-accent w-full"
          />
        </div>
        
        <div className="relative md:w-48">
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-10 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-accent w-full"
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
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/6"></div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Cards (Mobile View) */}
      <div className="md:hidden space-y-4">
        {!loading && filteredLogs.length === 0 && (
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No se encontraron registros</p>
          </div>
        )}

        {!loading && filteredLogs.map(log => (
          <div key={log.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{log.timestamp}</span>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeClass(log.eventType)}`}>
                {log.eventType === 'info' && 'Información'}
                {log.eventType === 'warning' && 'Advertencia'}
                {log.eventType === 'error' && 'Error'}
                {log.eventType === 'success' && 'Éxito'}
              </span>
            </div>
            
            <div className="mb-1 font-medium text-primary dark:text-white">{log.client}</div>
            <div className="mb-1 text-sm font-semibold">{log.event}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{log.details}</div>
          </div>
        ))}
      </div>

      {/* Logs Table (Desktop View) */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {!loading && filteredLogs.length === 0 ? (
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
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron registros</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Detalles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {!loading && filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {log.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {log.event}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEventTypeClass(log.eventType)}`}>
                        {log.eventType === 'info' && 'Info'}
                        {log.eventType === 'warning' && 'Warning'}
                        {log.eventType === 'error' && 'Error'}
                        {log.eventType === 'success' && 'Success'}
                      </span>
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

export default LogsPage;
