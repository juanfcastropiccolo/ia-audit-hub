import { useEffect, useState } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  teamId: string;
  clientName: string;
  agentRole: string;
  type: 'tool_call' | 'message' | 'review' | 'error';
  content: string;
  importance: 'low' | 'normal' | 'high' | 'critical';
}

function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [importanceFilter, setImportanceFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Fetch logs when component mounts
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/logs');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setLogs(data);
        setFilteredLogs(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setError('Failed to load logs. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Mock data for demonstration
  useEffect(() => {
    if (!isLoading && logs.length === 0 && !error) {
      const mockLogs: LogEntry[] = [
        { 
          id: 'log1', 
          timestamp: '2025-03-15T15:30:45Z', 
          teamId: 'team1',
          clientName: 'ACME Corporation',
          agentRole: 'Manager', 
          type: 'message',
          content: 'Manager -> Supervisor: Necesitamos finalizar la auditoría para el viernes.',
          importance: 'high'
        },
        { 
          id: 'log2', 
          timestamp: '2025-03-15T15:25:20Z', 
          teamId: 'team1',
          clientName: 'ACME Corporation',
          agentRole: 'Assistant', 
          type: 'tool_call',
          content: 'Assistant llamó a Google Sheets API para calcular ratios financieros.',
          importance: 'normal'
        },
        { 
          id: 'log3', 
          timestamp: '2025-03-15T15:20:10Z', 
          teamId: 'team2',
          clientName: 'Tech Industries',
          agentRole: 'Senior', 
          type: 'review',
          content: 'Senior aprobó el análisis de inventario preparado por Assistant.',
          importance: 'normal'
        },
        { 
          id: 'log4', 
          timestamp: '2025-03-15T15:15:00Z', 
          teamId: 'team2',
          clientName: 'Tech Industries',
          agentRole: 'Supervisor', 
          type: 'error',
          content: 'Error al acceder a la base de datos externa de transacciones.',
          importance: 'critical'
        },
        { 
          id: 'log5', 
          timestamp: '2025-03-15T14:50:00Z', 
          teamId: 'team3',
          clientName: 'Global Services',
          agentRole: 'Assistant', 
          type: 'message',
          content: 'Assistant -> Cliente: Necesito acceso a los estados financieros de Diciembre 2024.',
          importance: 'low'
        },
      ];
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
    }
  }, [isLoading, logs, error]);

  // Apply filters when they change
  useEffect(() => {
    let result = [...logs];
    
    if (typeFilter !== 'all') {
      result = result.filter(log => log.type === typeFilter);
    }
    
    if (importanceFilter !== 'all') {
      result = result.filter(log => log.importance === importanceFilter);
    }
    
    if (clientFilter !== 'all') {
      result = result.filter(log => log.clientName === clientFilter);
    }
    
    if (agentFilter !== 'all') {
      result = result.filter(log => log.agentRole === agentFilter);
    }
    
    setFilteredLogs(result);
  }, [logs, typeFilter, importanceFilter, clientFilter, agentFilter]);

  // Get unique values for filter dropdowns
  const uniqueClients = Array.from(new Set(logs.map(log => log.clientName)));
  const uniqueAgents = Array.from(new Set(logs.map(log => log.agentRole)));

  // Helper function for log importance styling
  const getImportanceStyles = (importance: string) => {
    switch (importance) {
      case 'low':
        return 'border-gray-300 dark:border-gray-600';
      case 'normal':
        return 'border-blue-300 dark:border-blue-600';
      case 'high':
        return 'border-amber-300 dark:border-amber-600';
      case 'critical':
        return 'border-red-400 dark:border-red-700';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  // Helper function for log type styling
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'message':
        return 'text-green-500 dark:text-green-400';
      case 'tool_call':
        return 'text-purple-500 dark:text-purple-400';
      case 'review':
        return 'text-blue-500 dark:text-blue-400';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
      <h2 className="text-2xl font-bold text-deepIndigo mb-6 dark:text-white">Logs del Sistema</h2>
      
      {/* Filters Section */}
      <div className="mb-6 bg-white p-4 rounded-2xl shadow dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-deepIndigo mb-3 dark:text-purpleTint">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="message">Mensajes</option>
              <option value="tool_call">Herramientas</option>
              <option value="review">Revisiones</option>
              <option value="error">Errores</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Importancia</label>
            <select 
              value={importanceFilter} 
              onChange={(e) => setImportanceFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todas</option>
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
            <select 
              value={clientFilter} 
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos los clientes</option>
              {uniqueClients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agente</label>
            <select 
              value={agentFilter} 
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Todos los agentes</option>
              {uniqueAgents.map(agent => (
                <option key={agent} value={agent}>{agent}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Logs Display */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deepIndigo"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <p className="text-center py-10 text-gray-500 dark:text-gray-400">No hay logs que coincidan con los filtros seleccionados</p>
          ) : (
            filteredLogs.map(log => (
              <div 
                key={log.id} 
                className={`p-4 border-l-4 ${getImportanceStyles(log.importance)} bg-white rounded-r-md shadow-sm dark:bg-gray-800 dark:text-white`}
              >
                <div className="flex justify-between mb-1">
                  <div>
                    <span className="font-medium mr-2">{log.clientName}</span>
                    <span className={`text-sm ${getTypeStyles(log.type)}`}>
                      [{log.type === 'tool_call' ? 'Herramienta' : 
                        log.type === 'message' ? 'Mensaje' : 
                        log.type === 'review' ? 'Revisión' : 'Error'}]
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-sm font-medium text-deepIndigo dark:text-purpleTint">{log.agentRole}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                  {log.content}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}

export default LogsPage; 