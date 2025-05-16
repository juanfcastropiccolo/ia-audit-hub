
import { format } from 'date-fns';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    role: 'user' | 'client' | 'assistant';
    timestamp: Date | string;
    fileUrl?: string;
    fileName?: string;
    model?: string;
  };
}

function ChatMessage({ message }: ChatMessageProps) {
  const isClient = message.role === "user" || message.role === "client";
  
  // Si es un mensaje del sistema, mostrar con estilo especial
  if (message.model === 'system') {
    return (
      <div className="py-2 px-4 my-2">
        <div className="bg-gray-100 dark:bg-gray-800 py-2 px-4 text-center text-sm text-gray-600 dark:text-gray-400 rounded-lg">
          {message.text}
        </div>
      </div>
    );
  }
  
  // Obtener la clase CSS para el tipo de mensaje
  const messageClass = isClient 
    ? "bg-accent text-primary" 
    : message.model === "error" || message.model === "error_fallback"
      ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" 
      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white";

  // Formatear la hora
  const time = message.timestamp 
    ? format(new Date(message.timestamp), 'HH:mm') 
    : '';
    
  // Obtener badge para el modelo
  const getModelBadge = () => {
    if (!message.model || isClient) return null;
    
    let badgeColor = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    
    switch (message.model) {
      case 'gemini':
        badgeColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        break;
      case 'claude':
        badgeColor = "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
        break;
      case 'gpt4':
        badgeColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        break;
      case 'mock':
        badgeColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        break;
      case 'error':
      case 'error_fallback':
        badgeColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
        break;
    }
    
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${badgeColor}`}>
        {message.model}
      </span>
    );
  };

  return (
    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'} my-3`}>
      <div className={`max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl px-4 py-2 rounded-2xl shadow-sm ${messageClass}`}>
        {!isClient && message.role === 'assistant' && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Asistente</div>
        )}
        
        <div className="whitespace-pre-wrap">
          {message.text}
        </div>
        
        {message.fileName && (
          <div className="mt-2 text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded-lg flex items-center">
            <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            {message.fileName}
          </div>
        )}
        
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          {!isClient && getModelBadge()}
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
