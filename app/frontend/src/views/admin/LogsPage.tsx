
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  clientId?: string;
  clientName?: string;
  agentType?: string;
  details?: Record<string, any>;
}

function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    level: 'all',
    clientId: '',
    search: ''
  });

  useEffect(() => {
    // Fetch logs from API
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        
        // Mock data for demonstration
        setTimeout(() => {
          const mockLogs: LogEntry[] = [
            {
              id: 'log1',
              timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
              level: 'info',
              message: 'Usuario iniciado sesión',
              clientId: 'client1',
              clientName: 'ACME Corporation',
              details: { userId: 'user123', ip: '192.168.1.1' }
            },
            {
              id: 'log2',
              timestamp: new Date(Date.now() - 3600000), // 1 hour ago
              level: 'warning',
              message: 'Documento con formato no compatible subido',
              clientId: 'client2',
              clientName: 'Tech Industries',
              agentType: 'assistant',
              details: { fileType: 'image/png', expectedTypes: ['application/pdf', 'text/csv'] }
            },
            {
              id: 'log3',
              timestamp: new Date(Date.now() - 7200000), // 2 hours ago
              level: 'error',
              message: 'Error al procesar análisis',
              clientId: 'client1',
              clientName: 'ACME Corporation',
              agentType: 'senior',
              details: { error: 'No se pudo leer el contenido del documento', documentId: 'doc456' }
            },
            {
              id: 'log4',
              timestamp: new Date(Date.now() - 86400000), // 1 day ago
              level: 'info',
              message: 'Informe generado exitosamente',
              clientId: 'client3',
              clientName: 'Global Services',
              agentType: 'manager',
              details: { reportId: 'report789', pageCount: 15 }
            },
            {
              id: 'log5',
              timestamp: new Date(Date.now() - 172800000), // 2 days ago
              level: 'info',
              message: 'Nueva sesión de auditoría iniciada',
              clientId: 'client4',
              clientName: 'Local Business',
              details: { sessionId: 'session101' }
            }
          ];
          
          setLogs(mockLogs);
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching logs:', error);
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on current filters
  const filteredLogs = logs.filter(log => {
    // Filter by level
    if (filter.level !== 'all' && log.level !== filter.level) {
      return false;
    }
    
    // Filter by client
    if (filter.clientId && log.clientId !== filter.clientId) {
      return false;
    }
    
    // Filter by search text in message or details
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesMessage = log.message.toLowerCase().includes(searchLower);
      const matchesClient = log.clientName?.toLowerCase().includes(searchLower);
      const matchesAgent = log.agentType?.toLowerCase().includes(searchLower);
      
      if (!matchesMessage && !matchesClient && !matchesAgent) {
        return false;
      }
    }
    
    return true;
  });

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  // Get unique client IDs for filter dropdown
  const clientOptions = Array.from(new Set(logs.map(log => log.clientId))).filter(Boolean) as string[];
  const clientNames = Object.fromEntries(
    logs
      .filter(log => log.clientId && log.clientName)
      .map(log => [log.clientId, log.clientName])
  );

  // Function to render log severity badge
  const renderLevelBadge = (level: 'info' | 'warning' | 'error') => {
    const levelStyles = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    
    const levelLabels = {
      info: 'Información',
      warning: 'Advertencia',
      error: 'Error'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelStyles[level]}`}>
        {levelLabels[level]}
      </span>
    );
  };

  // Function to render skeleton loading state
  const renderSkeletonLogs = () => {
    return Array(5).fill(null).map((_, index) => (
      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="mt-3 h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="mt-4 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    ));
  };

  return (
    <div className="p-6 bg-soft-background min-h-screen dark:bg-gray-900">
      <h2 className="text-2xl font-bold text-primary dark:text-white mb-6">Logs de Auditoría</h2>
      
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nivel
            </label>
            <select
              id="level-filter"
              value={filter.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos los niveles</option>
              <option value="info">Información</option>
              <option value="warning">Advertencia</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="client-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </label>
            <select
              id="client-filter"
              value={filter.clientId}
              onChange={(e) => handleFilterChange('clientId', e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Todos los clientes</option>
              {clientOptions.map(clientId => (
                <option key={clientId} value={clientId}>
                  {clientNames[clientId] || clientId}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar
            </label>
            <input
              id="search-filter"
              type="text"
              value={filter.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar en logs..."
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>
      
      {/* Logs display */}
      <div className="space-y-4">
        {isLoading ? (
          renderSkeletonLogs()
        ) : filteredLogs.length > 0 ? (
          filteredLogs.map(log => (
            <div key={log.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-r-0 border-t-0 border-b-0 border-solid border-transparent transition-all hover:border-primary">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <div className="flex items-center space-x-3 mb-2 md:mb-0">
                  {renderLevelBadge(log.level)}
                  {log.clientName && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Cliente: {log.clientName}
                    </span>
                  )}
                  {log.agentType && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Agente: {log.agentType}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {format(log.timestamp, "d 'de' MMMM, HH:mm", { locale: es })}
                </span>
              </div>
              
              <p className="text-gray-800 dark:text-gray-200 mb-2">{log.message}</p>
              
              {log.details && Object.keys(log.details).length > 0 && (
                <div className="mt-2">
                  <details className="text-sm">
                    <summary className="text-primary dark:text-accent cursor-pointer">
                      Ver detalles
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No se encontraron logs con los filtros seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LogsPage;
