import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageToAssistant, uploadFile, downloadAuditReport } from '../api/api';
import type { Message } from '../types';

const ChatInterface = () => {
  const [clientId] = useState(() => localStorage.getItem('clientId') || uuidv4());
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasReport, setHasReport] = useState<boolean>(false);
  
  // Guardar el clientId en localStorage
  useEffect(() => {
    localStorage.setItem('clientId', clientId);
  }, [clientId]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mensaje de bienvenida al cargar el componente
  useEffect(() => {
    setMessages([
      {
        id: uuidv4(),
        content: "¡Bienvenido al sistema de Auditoría IA! Soy tu asistente especializado en auditoría financiera. ¿En qué puedo ayudarte hoy?",
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !sessionId) return;
    
    setUploadProgress(true);
    try {
      // Informar al usuario que se está procesando el archivo
      const uploadingMessage: Message = {
        id: uuidv4(),
        content: `Subiendo archivo: ${selectedFile.name}...`,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, uploadingMessage]);

      // Subir el archivo al backend
      const response = await uploadFile(selectedFile, clientId, sessionId);
      
      // Mensaje de confirmación
      const confirmationMessage: Message = {
        id: uuidv4(),
        content: `He recibido tu archivo "${selectedFile.name}" y lo estoy procesando...`,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMessage]);
      
      // Si hay una respuesta del análisis del archivo, añadirla
      if (response.message) {
        const analysisMessage: Message = {
          id: uuidv4(),
          content: response.message,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, analysisMessage]);
      }
      
      // Limpiar la selección de archivo
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      // Mensaje de error
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: "Lo siento, ha ocurrido un error al procesar tu archivo. Por favor, intenta de nuevo.",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setUploadProgress(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si hay un archivo seleccionado, primero procesarlo
    if (selectedFile && sessionId) {
      await handleFileUpload();
    }
    
    // Luego procesar el mensaje de texto si existe
    if (!inputMessage.trim()) return;

    // Añadir mensaje del usuario al chat
    const userMessage: Message = {
      id: uuidv4(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Enviar mensaje al backend
      const response = await sendMessageToAssistant(inputMessage, clientId, sessionId);
      
      // Guardar sessionId para mensajes futuros
      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      // Añadir respuesta del asistente al chat
      const assistantMessage: Message = {
        id: uuidv4(),
        content: response.message,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Mensaje de error
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFileSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartNewChat = () => {
    // Confirmar con el usuario antes de borrar la conversación
    if (window.confirm('¿Estás seguro de que deseas iniciar una nueva conversación? Se perderá todo el historial actual.')) {
      setSessionId(undefined);
      setMessages([
        {
          id: uuidv4(),
          content: "¡Bienvenido a una nueva sesión de auditoría! ¿En qué puedo ayudarte hoy?",
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  };

  // Función para manejar el botón de descargar informe
  const handleDownloadReport = async () => {
    if (!sessionId) return;
    
    try {
      const blob = await downloadAuditReport(sessionId);
      
      // Crear URL para descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_auditoria_${sessionId.substring(0, 8)}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar informe:', error);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: "Lo siento, ha ocurrido un error al descargar el informe. Por favor, intenta de nuevo más tarde.",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    }
  };
  
  // Detectar disponibilidad de informe
  useEffect(() => {
    // Buscar en los mensajes del asistente si hay alguno que menciona que hay un informe final
    const reportAvailable = messages.some(
      m => m.sender === 'assistant' && 
      (m.content.includes('[INFORME FINAL GENERADO') || 
       m.content.includes('informe final generado') || 
       m.content.includes('reporte final generado'))
    );
    
    setHasReport(reportAvailable);
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-h-screen bg-white rounded-lg shadow-lg">
      {/* Encabezado del chat */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Asistente de Auditoría</h2>
        <div className="flex space-x-2">
          {hasReport && (
            <button
              onClick={handleDownloadReport}
              className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              title="Descargar el informe final de auditoría"
            >
              Descargar Informe
            </button>
          )}
          <button
            onClick={handleStartNewChat}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Nueva conversación
          </button>
        </div>
      </div>

      {/* Contenido del chat */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl px-4 py-2 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="block mt-1 text-xs opacity-75">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-center py-2">
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg">
              <span className="inline-block mr-2">Pensando</span>
              <span className="inline-block w-1 h-1 mx-1 bg-gray-500 rounded-full animate-pulse"></span>
              <span className="inline-block w-1 h-1 mx-1 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
              <span className="inline-block w-1 h-1 mx-1 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de subida de archivos */}
      <div className="px-4 py-2 border-t border-gray-200">
        {selectedFile ? (
          <div className="flex items-center mb-2">
            <span className="flex-1 truncate text-sm text-gray-600">{selectedFile.name}</span>
            <button 
              onClick={handleClearFileSelection}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : null}
        {uploadProgress && (
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full w-full animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Formulario de entrada */}
      <form onSubmit={handleSendMessage} className="flex items-center p-4 border-t">
        <label className="mr-2 cursor-pointer text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            ref={fileInputRef}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
          />
        </label>
        <input
          type="text"
          placeholder="Escribe tu mensaje..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading || (!inputMessage.trim() && !selectedFile)}
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ChatInterface; 