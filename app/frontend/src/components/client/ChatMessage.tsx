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
        <div className="system-message py-2 px-4">
          {message.text}
        </div>
      </div>
    );
  }
  
  // Obtener la clase CSS para el tipo de mensaje
  const messageClass = isClient 
    ? "user-message" 
    : message.model === "error" || message.model === "error_fallback"
      ? "assistant-message bg-red-100 text-red-800" 
      : "assistant-message";

  // Formatear la hora
  const time = message.timestamp 
    ? format(new Date(message.timestamp), 'HH:mm') 
    : '';
    
  // Obtener badge para el modelo
  const getModelBadge = () => {
    if (!message.model || isClient) return null;
    
    let badgeColor = "bg-gray-100 text-gray-800";
    
    switch (message.model) {
      case 'gemini':
        badgeColor = "bg-blue-100 text-blue-800";
        break;
      case 'claude':
        badgeColor = "bg-purple-100 text-purple-800";
        break;
      case 'gpt4':
        badgeColor = "bg-green-100 text-green-800";
        break;
      case 'mock':
        badgeColor = "bg-yellow-100 text-yellow-800";
        break;
      case 'error':
      case 'error_fallback':
        badgeColor = "bg-red-100 text-red-800";
        break;
    }
    
    return (
      <span className={`model-badge ${badgeColor}`}>
        {message.model}
      </span>
    );
  };

  return (
    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'} my-2 mx-4`}>
      <div className={`message-bubble ${messageClass}`}>
        {message.text}
        
        {message.fileName && (
          <div className="mt-2 text-sm">
            <span className="font-medium">Archivo:</span> {message.fileName}
          </div>
        )}
        
        <div className="mt-2 flex items-center justify-between text-xs opacity-70">
          {!isClient && getModelBadge()}
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage; 