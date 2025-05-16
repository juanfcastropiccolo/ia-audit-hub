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
    </div>
  );
}

export default ChatPage;
