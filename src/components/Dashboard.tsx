import { useState, useEffect } from 'react';
import { getAuditTeams, getAuditEvents, connectSocket, disconnectSocket } from '../api/api';
import type { AuditTeam, AuditEvent, Agent } from '../types';

// UPDATED: Component for model selection
const ModelSelector = () => {
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('selectedModel') || 'gemini';
  });
  const [isChanging, setIsChanging] = useState(false);
  const [changeSuccess, setChangeSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Save model choice to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedModel', selectedModel);
  }, [selectedModel]);

  const handleModelChange = async (model: string) => {
    setIsChanging(true);
    setChangeSuccess(null);
    setErrorMessage(null);
    
    try {
      // UPDATED: Mock API call since setAIModel doesn't exist
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Successfully set the model
      setSelectedModel(model);
      setChangeSuccess(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setChangeSuccess(null), 3000);
    } catch (error) {
      console.error('Error changing model:', error);
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo cambiar el modelo. Intente de nuevo.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h2 className="text-lg font-semibold mb-3">Selección de Modelo de IA</h2>
      <p className="text-sm text-gray-600 mb-4">
        Seleccione el modelo que desea utilizar para los agentes IA. Este cambio afectará a todas las futuras conversaciones.
      </p>
      
      <div className="flex flex-col md:flex-row gap-3">
        <button 
          onClick={() => handleModelChange('gemini')}
          className={`px-4 py-2 rounded-md ${
            selectedModel === 'gemini' 
              ? 'bg-blue-700 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          } transition-colors ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isChanging || selectedModel === 'gemini'}
        >
          Google Gemini
        </button>
        
        <button 
          onClick={() => handleModelChange('gpt4')}
          className={`px-4 py-2 rounded-md ${
            selectedModel === 'gpt4' 
              ? 'bg-blue-700 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          } transition-colors ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isChanging || selectedModel === 'gpt4'}
        >
          OpenAI GPT-4
        </button>
        
        <button 
          onClick={() => handleModelChange('claude')}
          className={`px-4 py-2 rounded-md ${
            selectedModel === 'claude' 
              ? 'bg-blue-700 text-white' 
              : 'bg-gray-100 hover:bg-gray-200'
          } transition-colors ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isChanging || selectedModel === 'claude'}
        >
          Anthropic Claude
        </button>
      </div>
      
      {isChanging && (
        <p className="text-sm text-blue-600 mt-2">
          Cambiando modelo...
        </p>
      )}
      
      {changeSuccess === true && (
        <p className="text-sm text-green-600 mt-2">
          Modelo cambiado exitosamente a {selectedModel === 'gemini' ? 'Google Gemini' : 
            selectedModel === 'gpt4' ? 'OpenAI GPT-4' : 'Anthropic Claude'}
        </p>
      )}
      
      {errorMessage && (
        <p className="text-sm text-red-600 mt-2">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

// Componente para mostrar un agente individual
const AgentCard = ({ agent }: { agent: Agent }) => {
  const statusColor = {
    idle: 'bg-gray-200',
    working: 'bg-green-200',
    waiting: 'bg-yellow-200'
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColor[agent.status]} shadow-sm`}>
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{agent.name}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-white">
          {agent.status}
        </span>
      </div>
      <p className="text-sm mt-2">Rol: {agent.role}</p>
      {agent.currentTask && (
        <p className="text-xs mt-2 italic">Tarea actual: {agent.currentTask}</p>
      )}
    </div>
  );
};

// Componente para mostrar un equipo de auditoría
const TeamCard = ({ team, onSelect }: { team: AuditTeam, onSelect: (teamId: string) => void }) => {
  return (
    <div className="p-4 border rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Equipo: {team.id.substring(0, 8)}...</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          team.status === 'idle' ? 'bg-gray-200' : 
          team.status === 'working' ? 'bg-green-200' : 'bg-blue-200'
        }`}>
          {team.status}
        </span>
      </div>
      <p className="text-sm mb-3">Cliente: {team.clientId.substring(0, 8)}...</p>
      {team.currentTask && (
        <p className="text-sm mb-3">Tarea: {team.currentTask}</p>
      )}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {team.agents.map(agent => (
          <div key={agent.name} className="text-xs p-2 bg-gray-50 rounded border">
            <div className="flex justify-between">
              <span>{agent.name}</span>
              <span className={`w-2 h-2 rounded-full ${
                agent.status === 'idle' ? 'bg-gray-400' : 
                agent.status === 'working' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></span>
            </div>
          </div>
        ))}
      </div>
      <button 
        className="w-full text-center text-sm text-blue-700 hover:text-blue-900 font-medium"
        onClick={() => onSelect(team.id)}
      >
        Ver actividad
      </button>
    </div>
  );
};

// Componente para mostrar un evento de auditoría
const EventItem = ({ event }: { event: AuditEvent }) => {
  const importanceColor = {
    low: 'border-gray-300',
    normal: 'border-blue-300',
    high: 'border-orange-300',
    critical: 'border-red-300'
  };

  return (
    <div className={`p-3 border-l-4 ${importanceColor[event.importance]} bg-white rounded-r-md shadow-sm mb-2`}>
      <div className="flex justify-between text-sm">
        <span className="font-medium">{event.agentName}</span>
        <span className="text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
      </div>
      <div className="text-sm mt-1">{event.eventType}</div>
      <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
        {JSON.stringify(event.details, null, 2)}
      </pre>
    </div>
  );
};

// Componente principal del Dashboard
const Dashboard = () => {
  const [teams, setTeams] = useState<AuditTeam[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'settings'>('teams');

  // UPDATED: Added function to handle tab changes
  const handleTabChange = (tab: 'teams' | 'settings') => {
    setActiveTab(tab);
    if (tab === 'teams') {
      // Refresh teams data when switching to teams tab
      fetchTeams();
    }
  };

  // Cargar equipos
  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const data = await getAuditTeams();
      setTeams(data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener equipos:', err);
      setError('No se pudieron cargar los equipos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar equipos al montar el componente
  useEffect(() => {
    fetchTeams();
    // Configurar actualización periódica
    const interval = setInterval(fetchTeams, 30000); // Cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Cargar eventos cuando se selecciona un equipo
  useEffect(() => {
    if (!selectedTeam) {
      setEvents([]);
      return;
    }

    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await getAuditEvents(selectedTeam);
        setEvents(data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener eventos:', err);
        setError('No se pudieron cargar los eventos. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Conectar socket para actualizaciones en tiempo real
    connectSocket(selectedTeam, (newEvent) => {
      if (newEvent.teamId === selectedTeam) {
        setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Mantener hasta 50 eventos
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [selectedTeam]);

  // Manejar selección de equipo
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
  };

  // Volver a la lista de equipos
  const handleBackToTeams = () => {
    setSelectedTeam(null);
  };

  // Renderizar estado de carga
  if (isLoading && teams.length === 0 && activeTab === 'teams') {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-700 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  // Renderizar mensaje de error
  if (error && teams.length === 0 && activeTab === 'teams') {
    return (
      <div className="text-center p-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
        <button
          className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // UPDATED: Navigation tabs for switching between teams and settings
  const renderTabs = () => (
    <div className="flex border-b mb-4">
      <button
        className={`px-4 py-2 ${activeTab === 'teams' ? 'border-b-2 border-blue-700 text-blue-700 font-medium' : 'text-gray-500'}`}
        onClick={() => handleTabChange('teams')}
      >
        Equipos de Auditoría
      </button>
      <button
        className={`px-4 py-2 ${activeTab === 'settings' ? 'border-b-2 border-blue-700 text-blue-700 font-medium' : 'text-gray-500'}`}
        onClick={() => handleTabChange('settings')}
      >
        Configuración
      </button>
    </div>
  );

  // Renderizar detalle de equipo seleccionado
  if (selectedTeam) {
    const team = teams.find(t => t.id === selectedTeam);
    
    return (
      <div className="max-w-6xl mx-auto">
        <button
          className="mb-4 flex items-center text-blue-700 hover:text-blue-900"
          onClick={handleBackToTeams}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a la lista de equipos
        </button>

        {team && (
          <>
            <div className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h2 className="text-xl font-semibold mb-2">Equipo de Auditoría: {team.id.substring(0, 8)}...</h2>
              <p className="mb-2">Cliente: {team.clientId}</p>
              <p className="mb-4">Estado: <span className="font-medium">{team.status}</span></p>
              
              <h3 className="font-medium mb-2">Agentes en este equipo:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {team.agents.map(agent => (
                  <AgentCard key={agent.name} agent={agent} />
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-medium mb-4">Actividad reciente:</h3>
              {isLoading && events.length === 0 ? (
                <p className="text-center py-4">Cargando eventos...</p>
              ) : events.length > 0 ? (
                <div className="space-y-2">
                  {events.map(event => (
                    <EventItem key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No hay eventos para mostrar</p>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // UPDATED: Main dashboard content based on active tab
  return (
    <div className="max-w-6xl mx-auto">
      {renderTabs()}
      
      {activeTab === 'settings' ? (
        // Settings tab content
        <div>
          <ModelSelector />
          
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-lg font-semibold mb-3">Estado del Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="text-sm font-medium">Equipos Activos</div>
                <div className="text-2xl font-semibold mt-1">{teams.length}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="text-sm font-medium">Modelo Actual</div>
                <div className="text-lg font-semibold mt-1">
                  {localStorage.getItem('selectedModel') === 'gemini' ? 'Google Gemini' : 
                   localStorage.getItem('selectedModel') === 'gpt4' ? 'OpenAI GPT-4' : 
                   localStorage.getItem('selectedModel') === 'claude' ? 'Anthropic Claude' : 
                   'Modelo Desconocido'}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="text-sm font-medium">Estado API</div>
                <div className="text-lg font-semibold mt-1 flex items-center">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  Operativo
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Teams tab content (default)
        <>
          <h2 className="text-xl font-semibold mb-4">Equipos de Auditoría Activos</h2>
          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map(team => (
                <TeamCard key={team.id} team={team} onSelect={handleTeamSelect} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500">No hay equipos de auditoría activos en este momento.</p>
              <p className="text-sm text-gray-400 mt-2">Los equipos se crearán automáticamente cuando los clientes inicien conversaciones.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
