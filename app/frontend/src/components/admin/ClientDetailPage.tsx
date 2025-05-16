import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Agent {
  id: string;
  role: string;
  status: 'idle' | 'executing' | 'waiting' | 'reviewing';
  lastAction?: string;
  memorySnippet?: string;
  children?: Agent[];
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  assignedAt: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'tool_call' | 'message' | 'review';
  agentRole: string;
  content: string;
}

function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [agents, setAgents] = useState<{ rootAgent: Agent } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Fetch client data when the component mounts
  useEffect(() => {
    const fetchClientData = async () => {
      if (!clientId) return;

      setIsLoading(true);
      try {
        // Fetch data in parallel
        const [agentsResponse, tasksResponse, logsResponse] = await Promise.all([
          fetch(`/api/agents?client=${clientId}`),
          fetch(`/api/tasks?client=${clientId}`),
          fetch(`/api/logs?client=${clientId}`),
        ]);

        if (!agentsResponse.ok || !tasksResponse.ok || !logsResponse.ok) {
          throw new Error('Error fetching client data');
        }

        const [agentsData, tasksData, logsData] = await Promise.all([
          agentsResponse.json(),
          tasksResponse.json(),
          logsResponse.json(),
        ]);

        setAgents(agentsData);
        setTasks(tasksData);
        setLogs(logsData);
        setError(null);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load client data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();

    // Optional: Set up a WebSocket or SSE connection for real-time updates
    // This would be implemented in a real application
    // const eventSource = new EventSource(`/api/logs/stream?client=${clientId}`);
    // eventSource.onmessage = (event) => {
    //   const newLog = JSON.parse(event.data);
    //   setLogs(prev => [newLog, ...prev]);
    // };
    // return () => eventSource.close();

  }, [clientId]);

  // Mock data for demonstration if the API doesn't return data
  useEffect(() => {
    if (!isLoading && !agents && !error) {
      // Create mock hierarchy
      setAgents({
        rootAgent: {
          id: 'manager1',
          role: 'Manager',
          status: 'idle',
          lastAction: 'Revisó informe final',
          children: [
            {
              id: 'supervisor1',
              role: 'Supervisor',
              status: 'executing',
              lastAction: 'Validando balance general',
              children: [
                {
                  id: 'senior1',
                  role: 'Senior',
                  status: 'waiting',
                  lastAction: 'Esperando documentos',
                  children: [
                    {
                      id: 'assistant1',
                      role: 'Assistant',
                      status: 'idle',
                      lastAction: 'Comunicación con cliente',
                    }
                  ]
                }
              ]
            }
          ]
        }
      });

      // Mock tasks
      setTasks([
        { id: 'task1', title: 'Revisión de balance general', assignedTo: 'Senior', assignedAt: '2025-03-15T14:30:00Z', status: 'in_progress' },
        { id: 'task2', title: 'Conciliación bancaria', assignedTo: 'Assistant', assignedAt: '2025-03-15T10:15:00Z', status: 'completed' },
        { id: 'task3', title: 'Verificación de inventario', assignedTo: 'Senior', assignedAt: '2025-03-14T09:00:00Z', status: 'pending' },
      ]);

      // Mock logs
      setLogs([
        { id: 'log1', timestamp: '2025-03-15T15:30:45Z', type: 'message', agentRole: 'Supervisor', content: 'Supervisor -> Senior: Por favor, verifica los totales del pasivo.' },
        { id: 'log2', timestamp: '2025-03-15T15:25:20Z', type: 'tool_call', agentRole: 'Assistant', content: 'Assistant invocó Google Sheets API para calcular footing del balance.' },
        { id: 'log3', timestamp: '2025-03-15T15:20:10Z', type: 'review', agentRole: 'Senior', content: 'Senior revisó y aprobó el análisis preliminar de indicadores.' },
        { id: 'log4', timestamp: '2025-03-15T15:15:00Z', type: 'message', agentRole: 'Manager', content: 'Manager -> Supervisor: Prioriza la revisión de estados financieros.' },
      ]);
    }
  }, [isLoading, agents, error]);

  // Function to render agent hierarchy recursively
  const renderAgentTree = (agent: Agent) => (
    <li key={agent.id} className="mb-2">
      <div 
        className="flex items-center cursor-pointer" 
        onClick={() => setSelectedAgent(agent)}
      >
        {/* Status indicator */}
        <span 
          className={`inline-block w-2 h-2 rounded-full mr-2 ${
            agent.status === "idle" ? "bg-gray-400" :
            agent.status === "executing" ? "bg-green-500 animate-pulse" :
            agent.status === "waiting" ? "bg-yellow-500" :
            agent.status === "reviewing" ? "bg-blue-500" : "bg-gray-300"
          }`}
        />
        <span className="font-medium text-deepIndigo dark:text-purpleTint">{agent.role}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({agent.status})</span>
      </div>
      {/* Render children if they exist */}
      {agent.children && agent.children.length > 0 && (
        <ul className="ml-6 mt-1 border-l border-gray-300 dark:border-gray-700 pl-4">
          {agent.children.map(child => renderAgentTree(child))}
        </ul>
      )}
    </li>
  );

  // Handle back button
  const handleBack = () => {
    navigate('/admin/clients');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deepIndigo"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 dark:bg-red-900 dark:text-red-300">
          {error}
        </div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-deepIndigo text-white rounded-md hover:bg-indigo-800"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <main className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
      <button 
        onClick={handleBack}
        className="flex items-center text-deepIndigo hover:text-indigo-800 mb-4 dark:text-lavenderMist dark:hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a Clientes
      </button>
      
      <h2 className="text-2xl font-bold text-deepIndigo mb-4 dark:text-white">
        Cliente {clientId}
      </h2>
      
      {/* Agent Hierarchy Section */}
      <section className="mb-6 bg-white p-5 rounded-2xl shadow dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-deepIndigo mb-3 dark:text-purpleTint">Agentes IA</h3>
        {agents && (
          <ul className="text-gray-800 dark:text-gray-200">
            {renderAgentTree(agents.rootAgent)}
          </ul>
        )}
      </section>

      {/* Tasks Section */}
      <section className="mb-6 bg-white p-5 rounded-2xl shadow dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-deepIndigo mb-3 dark:text-purpleTint">Tareas Asignadas</h3>
        {tasks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No hay tareas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Tarea</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Asignado a</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{task.assignedTo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(task.assignedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {task.status === 'completed' ? 'Completado' :
                         task.status === 'in_progress' ? 'En progreso' :
                         'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Logs Section */}
      <section className="bg-white p-5 rounded-2xl shadow dark:bg-gray-800">
        <h3 className="text-xl font-semibold text-deepIndigo mb-3 dark:text-purpleTint">Histórico de Interacciones</h3>
        <div className="bg-black text-gray-100 p-4 rounded-xl h-64 overflow-y-auto text-sm font-mono">
          {logs.map((entry, idx) => (
            <div key={entry.id || idx} className="mb-1">
              <span className="text-gray-500 mr-2">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>
              <span className={`mr-2 ${
                entry.type === 'tool_call' ? 'text-purple-400' :
                entry.type === 'message' ? 'text-green-400' :
                entry.type === 'review' ? 'text-blue-400' : 'text-gray-400'
              }`}>
                [{entry.type === 'tool_call' ? 'Tool' :
                  entry.type === 'message' ? 'Msg' :
                  entry.type === 'review' ? 'Review' : 'Info'}]
              </span>
              <span className="text-yellow-300">{entry.agentRole}:</span>
              <span className="ml-2">{entry.content}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Modal for agent details */}
      {selectedAgent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedAgent(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-96 max-w-md shadow-lg dark:bg-gray-800 dark:text-white" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-deepIndigo dark:text-purpleTint">
                Detalles de {selectedAgent.role}
              </h4>
              <button 
                onClick={() => setSelectedAgent(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</p>
                <p className="font-medium">{selectedAgent.status}</p>
              </div>
              
              {selectedAgent.lastAction && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Última acción</p>
                  <p>{selectedAgent.lastAction}</p>
                </div>
              )}
              
              {selectedAgent.memorySnippet && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Memoria</p>
                  <p className="text-sm bg-gray-100 p-2 rounded dark:bg-gray-700">
                    {selectedAgent.memorySnippet}
                  </p>
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setSelectedAgent(null)} 
              className="mt-6 w-full bg-purpleTint text-white py-2 px-4 rounded-lg hover:bg-deepIndigo"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ClientDetailPage; 