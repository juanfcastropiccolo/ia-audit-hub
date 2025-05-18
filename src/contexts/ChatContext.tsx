import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { sendMessageToLLM, uploadFileForAnalysis } from '../api/apiService';

// Lista de modelos disponibles
export type LLMModel = 'mock' | 'gemini' | 'claude' | 'gpt4' | 'assistant' | 'system' | 'error' | 'error_fallback';

export type Message = {
  id: string;
  user_id: string;
  sender: 'client' | 'assistant' | 'senior' | 'supervisor' | 'manager';
  message: string;
  timestamp: string;
  model?: LLMModel;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
};

type ChatContextType = {
  messages: Message[];
  sendMessage: (text: string, model?: LLMModel, fileInfo?: { fileName: string; fileUrl: string; fileType: string }) => Promise<void>;
  uploadFile: (file: File) => Promise<{ fileName: string; fileUrl: string; fileType: string } | null>;
  isLoading: boolean;
  error: string | null;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [tableErrorOccurred, setTableErrorOccurred] = useState(false);
  const [sessionId] = useState<string>(() => uuidv4());

  // Create welcome message if no messages exist
  useEffect(() => {
    if (user && messages.length === 0 && !isLoading) {
      // Add a welcome message from the system
      const welcomeMessage: Message = {
        id: uuidv4(),
        user_id: user?.id || 'anonymous',
        sender: 'assistant',
        message: '¡Bienvenido al chat de auditoría! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toISOString(),
        model: 'assistant' as LLMModel
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length, isLoading]);

  // Main effect for fetching messages and setting up subscriptions
  useEffect(() => {
    let subscription: any;
    let isMounted = true;
    setError(null);

    const fetchMessages = async () => {
      if (!user || tableErrorOccurred) {
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch existing messages
        const { data: messagesData, error: fetchError } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: true })
          .limit(100);
          
        if (fetchError) {
          console.error('Error fetching messages:', fetchError);
          
          if (fetchError.code === '42P01') { // Table doesn't exist error
            setTableErrorOccurred(true);
            setError('Servicio en modo de demostración. Las conversaciones no serán guardadas.');
          } else {
            setError('No se pudieron cargar los mensajes. Por favor, intenta nuevamente.');
          }
        } else if (isMounted) {
          setMessages(messagesData || []);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setError('Error de conexión. No se pudieron cargar los mensajes.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      // Set up real-time subscription for new messages if not already subscribed
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
              }
            });
        } catch (err) {
          console.error('Error setting up real-time subscription:', err);
        }
      }
    };

    fetchMessages();

    // Cleanup subscription on unmount or user change
    return () => {
      isMounted = false;
      if (subscription) {
        try {
          supabase.removeChannel(subscription);
        } catch (err) {
          console.error('Error removing channel:', err);
        }
      }
      setSubscribed(false);
    };
  }, [user, subscribed, tableErrorOccurred]);

  // Function to upload files
  const uploadFile = async (file: File) => {
    if (!user) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a unique name for the file
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // If we're in demo mode, simulate file upload
      if (tableErrorOccurred) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload time
        
        const mockFileUrl = `https://ejemplo.com/archivos/${fileName}`;
        setIsLoading(false);
        
        return {
          fileName: file.name,
          fileUrl: mockFileUrl,
          fileType: file.type
        };
      }
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        setError('No se pudo subir el archivo. Por favor, intenta nuevamente.');
        setIsLoading(false);
        return null;
      }
      
      // Get public URL for the file
      const { data: urlData } = await supabase.storage
        .from('chat-files')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // URL valid for 1 year
        
      // If we couldn't get the URL, use a relative URL based on env variable
      const fileUrl = urlData?.signedUrl || `https://wdhpfvgidwmporwuwtiy.supabase.co/storage/v1/object/public/chat-files/${filePath}`;
      
      setIsLoading(false);
      
      return {
        fileName: file.name,
        fileUrl,
        fileType: file.type
      };
    } catch (err) {
      console.error('Unexpected error uploading file:', err);
      setError('Error de conexión. El archivo no pudo ser subido.');
      setIsLoading(false);
      return null;
    }
  };

  // Function to send messages
  const sendMessage = async (text: string, model: LLMModel = 'gemini', fileInfo?: { fileName: string; fileUrl: string; fileType: string }) => {
    if (!user || (!text.trim() && !fileInfo)) return;
    
    setError(null);
    setIsLoading(true);

    // Create optimistic message for UI
    const optimisticId = uuidv4();
    const optimisticMessage: Message = {
      id: optimisticId,
      user_id: user?.id || 'anonymous',
      sender: 'client',
      message: text,
      timestamp: new Date().toISOString(),
      ...(fileInfo && { 
        fileName: fileInfo.fileName,
        fileUrl: fileInfo.fileUrl,
        fileType: fileInfo.fileType
      })
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Determine if we should use the real API or mock responses
      if (tableErrorOccurred) {
        // Use mock responses
        await new Promise(resolve => setTimeout(resolve, fileInfo ? 2000 : 1000));
        
        const mockResponse = getMockResponse(text, model, !!fileInfo);
        
        const responseMessage: Message = {
          id: uuidv4(),
          user_id: user?.id || 'anonymous',
          sender: 'assistant',
          message: fileInfo 
            ? `He recibido tu archivo "${fileInfo.fileName}". ${mockResponse}`
            : mockResponse,
          timestamp: new Date().toISOString(),
          model: model
        };
        
        setMessages(prev => [...prev, responseMessage]);
      } else {
        // Try to use the real API
        try {
          // Send message to LLM API
          const response = await sendMessageToLLM({
            message: text,
            clientId: user.id,
            sessionId,
            modelType: model,
            agentType: 'assistant'
          });
          
          // If we have a file, also process it
          if (fileInfo) {
            await uploadFileForAnalysis(
              new File(
                [new Blob(['file content'], { type: fileInfo.fileType })], 
                fileInfo.fileName
              ),
              user.id,
              sessionId,
              model
            );
          }
          
          // Add API response to chat
          const assistantMessage: Message = {
            id: uuidv4(),
            user_id: user?.id || 'anonymous',
            sender: 'assistant',
            message: response.message,
            timestamp: new Date().toISOString(),
            model: response.modelUsed as LLMModel
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Try to store in Supabase if available
          try {
            await supabase.from('messages').insert([
              {
                user_id: user.id,
                sender: 'client',
                message: text,
                model,
                metadata: fileInfo ? { fileName: fileInfo.fileName, fileUrl: fileInfo.fileUrl, fileType: fileInfo.fileType } : {}
              },
              {
                user_id: user.id,
                sender: 'assistant',
                message: response.message,
                model: response.modelUsed as LLMModel
              }
            ]);
          } catch (dbErr) {
            console.error('Error storing messages in database:', dbErr);
            // Don't show error to user as the messages already appear in UI
          }
        } catch (apiError) {
          console.error('API error, falling back to mock:', apiError);
          
          // Fall back to mock responses
          const mockResponse = getMockResponse(text, model, !!fileInfo);
          
          const fallbackMessage: Message = {
            id: uuidv4(),
            user_id: user?.id || 'anonymous',
            sender: 'assistant',
            message: fileInfo 
              ? `[Modo de respaldo] He recibido tu archivo "${fileInfo.fileName}". ${mockResponse}`
              : `[Modo de respaldo] ${mockResponse}`,
            timestamp: new Date().toISOString(),
            model: 'error_fallback' as LLMModel
          };
          
          setMessages(prev => [...prev, fallbackMessage]);
        }
      }
    } catch (err) {
      console.error('Unexpected error sending message:', err);
      
      // Keep optimistic message but show error
      const errorMessage: Message = {
        id: uuidv4(),
        user_id: user?.id || 'anonymous',
        sender: 'assistant',
        message: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        timestamp: new Date().toISOString(),
        model: 'error' as LLMModel
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError('Error de conexión. No se pudo procesar el mensaje.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function for mock responses
  const getMockResponse = (message: string, model: LLMModel = 'mock', isFileContext: boolean = false): string => {
    const lowerText = message.toLowerCase();
    let baseResponse = '';
    
    // If it's a file context, provide specialized responses
    if (isFileContext) {
      baseResponse = 'He analizado el archivo que has enviado. Parece contener información relevante para la auditoría. ¿Hay algún aspecto específico de los datos que quieras que revise?';
    } 
    // Simple keyword matching for mock responses
    else if (lowerText.includes('hola') || lowerText.includes('buenos días') || lowerText.includes('buenas')) {
      baseResponse = '¡Hola! ¿En qué puedo ayudarte con la auditoría hoy?';
    } else if (lowerText.includes('ayuda') || lowerText.includes('help')) {
      baseResponse = 'Puedo ayudarte con información sobre el proceso de auditoría, estado actual, documentos requeridos y resolver dudas específicas.';
    } else if (lowerText.includes('gracias')) {
      baseResponse = 'De nada. Estoy aquí para ayudarte con cualquier otra pregunta que tengas.';
    } else {
      baseResponse = 'Entiendo tu consulta. Para proporcionarte información precisa sobre la auditoría, ¿podrías proporcionar más detalles específicos sobre lo que necesitas?';
    }
    
    // Customize the response based on the model
    switch (model) {
      case 'gemini':
        return `${baseResponse}\n\n[Respuesta generada por Gemini, aprovechando mi entrenamiento multitarea en diversos dominios]`;
      
      case 'claude':
        return `${baseResponse}\n\n[Utilizando Claude para este análisis. Como asistente especializado en documentos, puedo procesar información de auditoría con alta precisión]`;
      
      case 'gpt4':
        return `${baseResponse}\n\n[Análisis de GPT-4: He procesado tu consulta considerando múltiples variables y contextos relevantes para auditoría]`;
      
      case 'mock':
      default:
        return baseResponse;
    }
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      sendMessage, 
      uploadFile,
      isLoading, 
      error 
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
