import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageToLLM, uploadFileForAnalysis } from '../api/apiService';
import type { LLMModel as ApiLLMModel_Internal } from '../api/apiService';

// Re-export ApiLLMModel for use in ChatPage
export type { ApiLLMModel_Internal as ApiLLMModel };

// Extended LLMModel type for frontend states (e.g., system messages, errors)
export type FrontendLLMModel = ApiLLMModel_Internal | 'assistant' | 'system' | 'error' | 'error_fallback';

export type Message = {
  id: string;
  user_id: string;
  sender: 'client' | 'assistant' | 'senior' | 'supervisor' | 'manager' | 'system'; // Added system here
  message: string;
  timestamp: string;
  model?: FrontendLLMModel; 
  fileName?: string; 
  fileUrl?: string; 
  fileType?: string; 
};

type ChatContextType = {
  messages: Message[];
  // sendMessage now takes an ApiLLMModel and an optional File object
  sendMessage: (text: string, model: ApiLLMModel_Internal, file?: File) => Promise<void>;
  // uploadFile remains for Supabase storage, primarily for getting a shareable URL or for record-keeping
  uploadFileToStorage: (file: File) => Promise<{ fileName: string; fileUrl: string; fileType: string } | null>;
  isLoading: boolean;
  error: string | null;
  currentModel: ApiLLMModel_Internal; // Exposed current model
  setCurrentModel: (model: ApiLLMModel_Internal) => void; // Function to set model from ChatPage
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [tableErrorOccurred, setTableErrorOccurred] = useState(false); // For Supabase table status
  const [sessionId] = useState<string>(() => uuidv4());
  const [currentModel, setCurrentModelInternal] = useState<ApiLLMModel_Internal>('gpt4'); // Default model: GPT-4

  const setCurrentModel = useCallback((model: ApiLLMModel_Internal) => {
    setCurrentModelInternal(model);
    console.log(`ChatContext: Model set to ${model}`);
  }, []);

  // Welcome message
  useEffect(() => {
    if (user && messages.length === 0 && !isLoading) {
      const welcomeMessage: Message = {
        id: uuidv4(),
        user_id: user?.id || 'anonymous',
        sender: 'assistant',
        message: '¡Bienvenido al chat de auditoría! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toISOString(),
        model: 'assistant' // This is a FrontendLLMModel for display
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length, isLoading]);

  // Fetch initial messages from Supabase (if tables exist)
  useEffect(() => {
    let subscription: any;
    let isMounted = true;
    setError(null);

    const fetchMessagesFromDB = async () => {
      if (!user || tableErrorOccurred) {
        console.log('Skipping fetch from DB: no user or table error.');
        return;
      }

      try {
        const { data: messagesData, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: true })
          .limit(100);
          
        if (fetchError) {
          console.error('Error fetching messages from Supabase:', fetchError);
          if (fetchError.code === '42P01') {
            setTableErrorOccurred(true);
            console.warn('Supabase \'messages\' table not found. History will not be loaded/saved to DB.');
          } else {
             console.error('Could not load messages from Supabase.');
          }
        } else if (isMounted && messagesData && messagesData.length > 0) {
           setMessages(prevMessages => {
            const dbMessageIds = new Set(messagesData.map(m => m.id));
            const uniquePrevMessages = prevMessages.filter(pm => !dbMessageIds.has(pm.id));
            return [...messagesData, ...uniquePrevMessages];
          });
        }
      } catch (err) {
        console.error('Failed to fetch messages from Supabase:', err);
      }
    };

    fetchMessagesFromDB();

    if (!subscribed && user && !tableErrorOccurred) {
        try {
          subscription = supabase
            .channel('messages-channel')
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${user.id}` },
              (payload) => {
                const newMessage = payload.new as Message;
                if (isMounted) {
                  setMessages(prev => 
                    prev.some(m => m.id === newMessage.id) 
                      ? prev 
                      : [...prev, newMessage]
                  );
                }
              }
            )
            .subscribe((status) => {
              if (status === 'SUBSCRIBED' && isMounted) {
                setSubscribed(true);
                console.log('Subscribed to Supabase message changes.');
              }
            });
        } catch (err) {
          console.error('Error setting up Supabase real-time subscription:', err);
        }
      }

    return () => {
      isMounted = false;
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (err) {
          console.error('Error removing Supabase channel:', err);
        }
      }
      setSubscribed(false);
    };
  }, [user, tableErrorOccurred]);

  // Upload file to Supabase storage (for links, previews)
  const uploadFileToStorage = async (file: File) => {
    if (!user) {
      setError("Usuario no autenticado.");
      return null;
    }
    
    let wasLoadingSet = false;
    try {
      setIsLoading(true);
      wasLoadingSet = true;
      setError(null);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      if (tableErrorOccurred) {
        console.warn("Table error: Simulating file upload to storage.");
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          fileName: file.name,
          fileUrl: `https://mockstorage.example.com/${filePath}`,
          fileType: file.type
        };
      }
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading file to Supabase Storage:', uploadError);
        setError('No se pudo subir el archivo al almacenamiento. Por favor, intenta nuevamente.');
        return null;
      }
      
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);
        
      return {
        fileName: file.name,
        fileUrl: urlData.publicUrl,
        fileType: file.type
      };
    } catch (err) {
      console.error('Unexpected error uploading file to Supabase Storage:', err);
      setError('Error de conexión. El archivo no pudo ser subido al almacenamiento.');
      return null;
    } finally {
      if (wasLoadingSet) setIsLoading(false);
    }
  };
  
  // Helper for fallback mock responses (only used if API calls fail catastrophically or if model is 'mock')
  const getFallbackMockResponse = (message: string, model: ApiLLMModel_Internal, isFileContext: boolean = false): string => {
    const lowerText = message.toLowerCase();
    let baseResponse = '';
    if (isFileContext) {
      baseResponse = 'He procesado el archivo (respuesta simulada de respaldo). ¿Qué deseas saber sobre él?';
    } else if (lowerText.includes('hola')) {
      baseResponse = '¡Hola! (Respuesta simulada de respaldo)';
    } else {
      baseResponse = 'Entendido. (Respuesta simulada de respaldo)';
    }
    return `${baseResponse} [Fallback Mock from ${model}]`;
  };

  const sendMessage = async (text: string, model: ApiLLMModel_Internal, file?: File) => {
    if (!user) {
      setError("Usuario no autenticado. No se puede enviar el mensaje.");
      return;
    }
    if (!text.trim() && !file) {
      if (!file) {
        setError("No se puede enviar un mensaje vacío sin un archivo.");
        return;
      }
    }
    
    setError(null);
    setIsLoading(true);

    const optimisticUserMessageId = uuidv4();
    const userMessageText = text.trim() || (file ? `Archivo adjunto: ${file.name}` : "Consulta sobre archivo");
    
    const optimisticUserMessage: Message = {
      id: optimisticUserMessageId,
      user_id: user.id,
      sender: 'client',
      message: userMessageText,
      timestamp: new Date().toISOString(),
      model: model, 
      ...(file && { fileName: file.name, fileType: file.type, fileUrl: URL.createObjectURL(file) }) // optimistic URL for preview
    };
    setMessages(prev => [...prev, optimisticUserMessage]);

    try {
      let assistantResponseText = '';
      let assistantModelUsed: FrontendLLMModel = model;
      let responseFileName = file?.name;
      let responseFileType = file?.type;
      let responseFileUrl: string | undefined = optimisticUserMessage.fileUrl; // Keep optimistic URL for now

      // ----- Real API Interaction via apiService.ts -----
      if (file) {
        // Logic for handling file uploads and potentially text with files
        const processingFileMessage: Message = {
          id: uuidv4(), user_id: user.id, sender: 'system', 
          message: `Procesando "${file.name}" con ${getModelDisplayName(model as FrontendLLMModel)}...`,
          timestamp: new Date().toISOString(), model: 'system'
        };
        setMessages(prev => [...prev, processingFileMessage]);

        try {
          // uploadFileForAnalysis will use the model passed to it.
          // If model is 'mock', apiService.ts handles that.
          const fileApiResponse = await uploadFileForAnalysis(file, user.id, sessionId, model);
          assistantResponseText = fileApiResponse.message;
          assistantModelUsed = fileApiResponse.modelUsed as FrontendLLMModel;
          
          // Update interim message with actual file processing response
          const fileResponseMessage: Message = {
              id: uuidv4(), user_id: user.id, sender: 'assistant',
              message: assistantResponseText, timestamp: new Date().toISOString(), model: assistantModelUsed,
              fileName: responseFileName, fileType: responseFileType, fileUrl: responseFileUrl // Use file info from user message
          };
          setMessages(prev => prev.map(m => m.id === processingFileMessage.id ? fileResponseMessage : m));

          // If user also provided text with the file, send it as a follow-up.
          if (text.trim()) {
              const followupProcessingMessage: Message = {
                id: uuidv4(), user_id: user.id, sender: 'system', 
                message: `Analizando tu consulta sobre el archivo con ${getModelDisplayName(model as FrontendLLMModel)}...`,
                timestamp: new Date().toISOString(), model: 'system'
              };
              setMessages(prev => [...prev, followupProcessingMessage]);

              const textApiResponse = await sendMessageToLLM({
                  message: text, 
                  clientId: user.id, sessionId, modelType: model, agentType: 'assistant'
              });
              assistantResponseText = textApiResponse.message; // Override with the latest response
              assistantModelUsed = textApiResponse.modelUsed as FrontendLLMModel;

              const textResponseMessage: Message = {
                  id: uuidv4(), user_id: user.id, sender: 'assistant',
                  message: assistantResponseText, timestamp: new Date().toISOString(), model: assistantModelUsed,
                  // Link to file if relevant
                  fileName: responseFileName, fileType: responseFileType, fileUrl: responseFileUrl
              };
              setMessages(prev => prev.map(m => m.id === followupProcessingMessage.id ? textResponseMessage : m));
          }
        } catch (apiError: any) {
          console.error('Error during file processing or follow-up API call:', apiError);
          setError(`Error de API: ${apiError.message || 'No se pudo procesar la solicitud.'}`);
          assistantResponseText = getFallbackMockResponse(userMessageText, model, !!file) + ` (Error de API: ${apiError.message})`,
          assistantModelUsed = 'error_fallback';
           // Replace system message with error or add new error message
           setMessages(prev => {
            const systemMessages = prev.filter(m => m.sender === 'system');
            if (systemMessages.length > 0) {
              return prev.map(m => m.id === systemMessages[systemMessages.length -1].id ? ({ 
                  id: uuidv4(), user_id: user.id, sender: 'assistant', 
                  message: assistantResponseText, timestamp: new Date().toISOString(), model: assistantModelUsed 
              } as Message) : m).filter(m => m.sender !== 'system');
            } else {
              return [...prev, { 
                  id: uuidv4(), user_id: user.id, sender: 'assistant', 
                  message: assistantResponseText, timestamp: new Date().toISOString(), model: assistantModelUsed 
              } as Message];
            }
          });
        }
      } else {
        // Only text message, no file
        try {
          const apiResponse = await sendMessageToLLM({
            message: text,
            clientId: user.id, sessionId, modelType: model, agentType: 'assistant'
          });
          assistantResponseText = apiResponse.message;
          assistantModelUsed = apiResponse.modelUsed as FrontendLLMModel;

          const assistantMessage: Message = {
            id: uuidv4(), user_id: user.id, sender: 'assistant',
            message: assistantResponseText, timestamp: new Date().toISOString(),
            model: assistantModelUsed
          };
          setMessages(prev => [...prev, assistantMessage]);

        } catch (apiError: any) {
          console.error('Error sending text message to LLM API:', apiError);
          setError(`Error de API: ${apiError.message || 'No se pudo enviar el mensaje.'}`);
          assistantResponseText = getFallbackMockResponse(text, model) + ` (Error de API: ${apiError.message})`,
          assistantModelUsed = 'error_fallback';
          const assistantMessage: Message = {
            id: uuidv4(), user_id: user.id, sender: 'assistant',
            message: assistantResponseText, timestamp: new Date().toISOString(),
            model: assistantModelUsed
          };
          setMessages(prev => [...prev, assistantMessage]);
        }
      }

      // Clean up system messages if any successful main response was added
      // This part needs to be careful if an error occurred after a system message was shown but before a main response replaced it.
      if (assistantModelUsed !== 'error_fallback' && assistantModelUsed !== 'error') {
        setMessages(prev => prev.filter(m => m.sender !== 'system'));
      }

      // If Supabase persistence is desired AND the backend doesn't handle it.
      // For now, assuming backend handles persistence if API call was successful.
      // if (!tableErrorOccurred && model !== 'mock' && assistantModelUsed !== 'error_fallback' && assistantModelUsed !== 'error') {
      //   // ... Supabase insert logic if needed ...
      // }

    } catch (err: any) { 
      console.error('Unexpected error in sendMessage global try-catch:', err);
      setError(`Error inesperado: ${err.message || 'Ocurrió un problema.'}`);
      const errorMessage: Message = {
        id: uuidv4(),
        user_id: user?.id || 'anonymous',
        sender: 'assistant',
        message: `Lo siento, ocurrió un error inesperado al procesar tu solicitud. (${err.message})`,
        timestamp: new Date().toISOString(),
        model: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      setMessages(prev => prev.filter(m => m.sender !== 'system')); // Clean up system messages on global error too
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      uploadFileToStorage, 
      isLoading, 
      error,
      currentModel,
      setCurrentModel
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Helper function getModelDisplayName also needs to be available or imported if used inside this file directly
// For now, assuming it's mainly used in ChatPage.tsx. If ChatContext needs it for system messages:
const getModelDisplayName = (model: FrontendLLMModel): string => {
    switch(model) {
      case 'mock': return 'Demo';
      case 'gemini': return 'Gemini Pro';
      case 'claude': return 'Claude 3';
      case 'gpt4': return 'GPT-4 Turbo';
      case 'assistant': return 'Asistente IA'; // Clarified display name
      case 'system': return 'Sistema';
      case 'error': return 'Error de Sistema';
      case 'error_fallback': return 'Asistente (Respaldo)';
      default:
        const exhaustiveCheck: never = model; // Ensures all cases are handled
        return 'Desconocido';
    }
  };
