
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { Message, MessageRole } from '@/types';
import { mockChatApi as chatApi } from '@/api/apiService';

interface ChatContextType {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  isTyping: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await chatApi.getMessages();
        
        if (response.success) {
          setMessages(response.data);
        } else {
          setError(response.message || 'Error fetching messages');
          toast.error(response.message || 'Error fetching messages');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);
  
  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;
    
    // Add user message to the list immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: MessageRole.USER,
      content,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      // Show typing indicator
      setIsTyping(true);
      
      // Send message to API
      const response = await chatApi.sendMessage(content);
      
      // Update user message to sent status
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent', id: Date.now().toString() } 
            : msg
        )
      );
      
      // Wait a moment before showing response (for UX)
      setTimeout(() => {
        if (response.success) {
          setIsTyping(false);
          // Add AI response to the list
          setMessages(prevMessages => [...prevMessages, response.data]);
        } else {
          setIsTyping(false);
          setError(response.message || 'Error sending message');
          toast.error(response.message || 'Error sending message');
        }
      }, 500);
      
    } catch (error) {
      setIsTyping(false);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Update user message to error status
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' } 
            : msg
        )
      );
    }
  };
  
  const uploadDocument = async (file: File): Promise<void> => {
    // Show uploading message
    const uploadingMessage: Message = {
      id: `upload-${Date.now()}`,
      role: MessageRole.SYSTEM,
      content: `Subiendo documento: ${file.name}...`,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    
    setMessages(prevMessages => [...prevMessages, uploadingMessage]);
    
    try {
      const response = await chatApi.uploadDocument(file);
      
      // Remove uploading message and add confirmation
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== uploadingMessage.id)
      );
      
      if (response.success) {
        setMessages(prevMessages => [...prevMessages, response.data]);
        toast.success(`Documento "${file.name}" subido con éxito`);
      } else {
        setError(response.message || 'Error uploading document');
        toast.error(response.message || 'Error uploading document');
      }
    } catch (error) {
      // Remove uploading message
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== uploadingMessage.id)
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Error al subir el documento: ${errorMessage}`);
    }
  };
  
  const value = {
    messages,
    loading,
    error,
    sendMessage,
    uploadDocument,
    isTyping
  };
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};
