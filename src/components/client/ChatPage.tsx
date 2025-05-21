import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendMessageToLLM, uploadFileForAnalysis, type LLMModel } from '../../api/apiService';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'client' | 'assistant';
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  model?: string; // Adding model info to display which model generated the response
}

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextPrepared, setContextPrepared] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [summaryPreview, setSummaryPreview] = useState<string>('');
  const [userInfo, setUserInfo] = useState<{ email: string, role: string, name: string } | null>(null);
  const [sessionId, setSessionId] = useState(() => uuidv4());
  const [selectedModel, setSelectedModel] = useState<LLMModel>('mock'); // Default to mock for demo purposes

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Get user from localStorage (set during login)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        // Handle error, maybe redirect to login
      }
    }

    // Initialize welcome message
    setMessages([
      {
        id: uuidv4(),
        text: '¡Bienvenido a la plataforma de Auditoría IA! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
        role: 'assistant',
        timestamp: new Date(),
        model: 'system'
      }
    ]);
  }, []);

  // Handler for model changes in the header
  const handleModelChange = (newModel: LLMModel) => {
    setSelectedModel(newModel);
    
    // Notify the user about the model change
    const systemMsg: Message = {
      id: uuidv4(),
      text: `Has cambiado al modelo ${getModelDisplayName(newModel)}. Ahora tus mensajes serán procesados usando este modelo.`,
      role: 'assistant',
      timestamp: new Date(),
      model: 'system'
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  // Helper function to get a user-friendly name for the model
  const getModelDisplayName = (model: LLMModel): string => {
    switch (model) {
      case 'gemini': return 'Gemini (Google)';
      case 'claude': return 'Claude (Anthropic)';
      case 'gpt4': return 'GPT-4 (OpenAI)';
      case 'mock': return 'Mock (Simulación)';
      default: return model;
    }
  };

  const sendMessage = async () => {
    const text = currentMessage.trim();
    if (!text || isLoading || !userInfo) return;
    
    const userMsg: Message = {
      id: uuidv4(),
      text,
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Call the API service with the selected model
      const response = await sendMessageToLLM({
        message: text,
        clientId: userInfo.email,
        sessionId,
        modelType: selectedModel,
        agentType: 'assistant' // Default to assistant agent
      });
      
      // Update session ID if needed
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
      }
      
      // Add the response to messages
      const assistantMsg: Message = {
        id: uuidv4(),
        text: response.message,
        role: 'assistant',
        timestamp: new Date(),
        model: response.modelUsed // Tag the message with the model that generated it
      };
      setMessages(prev => [...prev, assistantMsg]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorText = error instanceof Error ? error.message : 'No se pudo enviar el mensaje.';
      const errorMsg: Message = {
        id: uuidv4(),
        text: `Error: ${errorText}`,
        role: 'assistant',
        timestamp: new Date(),
        model: 'error'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userInfo) return;

    const uploadMsg: Message = {
      id: uuidv4(),
      text: `[Archivo "${file.name}" subido. Procesando...]`,
      role: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, uploadMsg]);
    setIsLoading(true);

    try {
      // Use the API service for file uploads
      const response = await uploadFileForAnalysis(
        file,
        userInfo.email,
        sessionId,
        selectedModel
      );
      
      const responseMsg: Message = {
        id: uuidv4(),
        text: response.message,
        role: 'assistant',
        timestamp: new Date(),
        model: response.modelUsed,
        fileName: file.name
      };
      setMessages(prev => [...prev, responseMsg]);
      // Mark context as prepared and store summary preview
      setContextPrepared(true);
      setSummaryPreview(response.message);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorText = error instanceof Error ? error.message : 'Error al subir el archivo.';
      const errorMsg: Message = {
        id: uuidv4(),
        text: `Error: ${errorText}`,
        role: 'assistant',
        timestamp: new Date(),
        model: 'error'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <ChatHeader 
        selectedModel={selectedModel} 
        onModelChange={handleModelChange} 
        userInfo={userInfo}
      />
      
      <div className="flex-1 overflow-y-auto px-4 py-4 chat-messages-container">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt"
        />
      </div>
      
      <ChatInput 
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        sendMessage={sendMessage}
        handleUploadClick={handleUploadClick}
        isLoading={isLoading}
      />
      {/* Start Audit Button */}
      {contextPrepared && !isLoading && (
        <div className="fixed bottom-24 w-full flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-lg"
          >
            Iniciar Auditoría
          </button>
        </div>
      )}
      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar inicio de auditoría</h3>
            <p className="mb-4">Resumen del contexto preparado:</p>
            <div className="mb-4 p-2 border rounded max-h-48 overflow-y-auto text-sm bg-gray-50 dark:bg-gray-700">
              {summaryPreview}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >Cancelar</button>
              <button
                onClick={async () => {
                  setShowModal(false);
                  setIsLoading(true);
                  // Call start-audit endpoint
                  const form = new FormData();
                  form.append('client_id', userInfo.email);
                  form.append('session_id', sessionId);
                  form.append('model_type', selectedModel);
                  try {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://'+window.location.hostname+':8000'}/api/start-audit`, {
                      method: 'POST', body: form
                    });
                    const data = await res.json();
                    // Notify user and provide link
                    const finishMsg: Message = {
                      id: uuidv4(), role: 'assistant', text: `La auditoría ha finalizado. Descarga el informe completo aquí: ${data.report_url}`, timestamp: new Date(), model: 'assistant'
                    };
                    setMessages(prev => [...prev, finishMsg]);
                  } catch (err) {
                    console.error('Error starting audit:', err);
                    const errMsg: Message = { id: uuidv4(), role: 'assistant', text: 'Error al iniciar la auditoría. Intenta nuevamente.', timestamp: new Date(), model: 'assistant' };
                    setMessages(prev => [...prev, errMsg]);
                  } finally { setIsLoading(false); }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >Iniciar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
