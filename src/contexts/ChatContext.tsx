import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Lista de modelos disponibles
export type LLMModel = 'mock' | 'gemini' | 'claude' | 'gpt4';

export type Message = {
  id: string;
  user_id: string;
  sender: 'client' | 'assistant' | 'senior' | 'supervisor' | 'manager';
  message: string;
  timestamp: string;
  model?: LLMModel; // Modelo que generó este mensaje
};

type ChatContextType = {
  messages: Message[];
  sendMessage: (text: string, model?: LLMModel) => Promise<void>;
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
  const [currentModel, setCurrentModel] = useState<LLMModel>('mock');

  // Create welcome message if no messages exist
  useEffect(() => {
    if (user && messages.length === 0 && !isLoading) {
      // Add a welcome message from the system
      const welcomeMessage: Message = {
        id: uuidv4(),
        user_id: user?.id || 'anonymous',
        sender: 'assistant',
        message: '¡Bienvenido al chat de auditoría! ¿En qué puedo ayudarte hoy?',
        timestamp: new Date().toISOString(),
        model: 'mock'
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
        
        // Fetch existing messages with timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 10000); // 10 seconds timeout
        
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: true })
          .limit(100)
          .abortSignal(abortController.signal);
          
        clearTimeout(timeoutId);

        if (error) {
          console.error('Error fetching messages:', error);
          
          if (error.code === '42P01') {
            setTableErrorOccurred(true);
            setError('Servicio en modo de demostración. Las conversaciones no serán guardadas.');
          } else {
            setError('No se pudieron cargar los mensajes. Por favor, intenta nuevamente.');
          }
        } else if (isMounted) {
          setMessages(data || []);
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

  const sendMessage = async (text: string, model?: LLMModel) => {
    if (!user || !text.trim()) return;
    
    // Usar el modelo proporcionado o el actual por defecto
    const modelToUse = model || currentModel;
    
    // Si se proporciona un modelo diferente, actualizarlo
    if (model && model !== currentModel) {
      setCurrentModel(model);
    }
    
    setError(null);

    // Optimistically add message to UI
    const optimisticId = uuidv4();
    const optimisticMessage: Message = {
      id: optimisticId,
      user_id: user?.id || 'anonymous',
      sender: 'client',
      message: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      if (tableErrorOccurred) {
        setTimeout(() => {
          const responseId = uuidv4();
          const responseMessage: Message = {
            id: responseId,
            user_id: user?.id || 'anonymous',
            sender: 'assistant',
            message: getMockResponse(text, modelToUse),
            timestamp: new Date().toISOString(),
            model: modelToUse
          };
          setMessages(prev => [...prev, responseMessage]);
        }, 1000);
        return;
      }

      // Send to Supabase with timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5 seconds timeout
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          user_id: user.id,
          sender: 'client',
          message: text,
          model: modelToUse
        })
        .select()
        .abortSignal(abortController.signal)
        .single();
        
      clearTimeout(timeoutId);

      if (error) {
        console.error('Error sending message:', error);
        
        if (error.code === '42P01') {
          setTableErrorOccurred(true);
          
          setTimeout(() => {
            const responseId = uuidv4();
            const responseMessage: Message = {
              id: responseId,
              user_id: user?.id || 'anonymous',
              sender: 'assistant',
              message: getMockResponse(text, modelToUse),
              timestamp: new Date().toISOString(),
              model: modelToUse
            };
            setMessages(prev => [...prev, responseMessage]);
          }, 1000);
          
          setError('Servicio en modo de demostración. Las conversaciones no serán guardadas.');
        } else {
          // Remove optimistic message on error
          setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
          setError('No se pudo enviar el mensaje. Por favor, intenta nuevamente.');
        }
        return;
      }

      // Replace optimistic message with actual one from server
      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === optimisticId ? data : msg
        ));
      }
      
      // Add mock response (for demo purposes since there's no LLM)
      setTimeout(() => {
        const responseId = uuidv4();
        const responseMessage: Message = {
          id: responseId,
          user_id: user?.id || 'anonymous',
          sender: 'assistant',
          message: getMockResponse(text, modelToUse),
          timestamp: new Date().toISOString(),
          model: modelToUse
        };
        setMessages(prev => [...prev, responseMessage]);
      }, 1000);
      
    } catch (err) {
      console.error('Unexpected error sending message:', err);
      // Keep optimistic message but mark as error
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticId 
          ? {...msg, message: msg.message + ' (no enviado)'}
          : msg
      ));
      setError('Error de conexión. El mensaje no pudo ser enviado.');
    }
  };
  
  // Helper function for mock responses
  const getMockResponse = (message: string, model: LLMModel = 'mock'): string => {
    const lowerText = message.toLowerCase();
    
    // Respuestas diferentes según el modelo
    let baseResponse = '';
    
    // Simple keyword matching for mock responses
    if (lowerText.includes('hola') || lowerText.includes('buenos días') || lowerText.includes('buenas')) {
      baseResponse = '¡Hola! ¿En qué puedo ayudarte con la auditoría hoy?';
    } else if (lowerText.includes('ayuda') || lowerText.includes('help')) {
      baseResponse = 'Puedo ayudarte con información sobre el proceso de auditoría, estado actual, documentos requeridos y resolver dudas específicas.';
    } else if (lowerText.includes('gracias')) {
      baseResponse = 'De nada. Estoy aquí para ayudarte con cualquier otra pregunta que tengas.';
    } else {
      baseResponse = 'Entiendo tu consulta. Para proporcionarte información precisa sobre la auditoría, ¿podrías proporcionar más detalles específicos sobre lo que necesitas?';
    }
    
    // Personalizar la respuesta según el modelo
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
    <ChatContext.Provider value={{ messages, sendMessage, isLoading, error }}>
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
