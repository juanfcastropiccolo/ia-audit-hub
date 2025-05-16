
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Message, MessageRole } from '@/types';
import { mockChatApi as chatApi } from '@/api/apiService';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useSocketConnection } from '@/hooks/useSocketConnection';

interface ChatContextType {
  messages: Message[];
  loading: boolean;
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const { isConnected } = useSocketConnection();
  
  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setLoading(true);
        const response = await chatApi.getChatHistory();
        
        if (response.success) {
          setMessages(response.data);
        } else {
          toast.error(response.message || 'Error loading chat history');
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        toast.error('Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };
    
    loadChatHistory();
  }, []);
  
  // Function to send a message
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    try {
      // Add pending message
      const tempId = uuidv4();
      const pendingMessage: Message = {
        id: tempId,
        content,
        timestamp: new Date().toISOString(),
        role: MessageRole.USER,
        status: 'sending'
      };
      
      setMessages((prev) => [...prev, pendingMessage]);
      
      // Show typing indicator
      setIsTyping(true);
      
      // Send to API
      const response = await chatApi.sendMessage(content);
      
      // Update pending message to delivered
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: 'delivered' } : msg
        )
      );
      
      // Add response from assistant
      if (response.success) {
        setTimeout(() => {
          setMessages((prev) => [...prev, response.data]);
          setIsTyping(false);
        }, 500);
      } else {
        toast.error(response.message || 'Failed to send message');
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setIsTyping(false);
      
      // Mark message as error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.content === content && msg.status === 'sending'
            ? { ...msg, status: 'error' }
            : msg
        )
      );
    }
  };
  
  // Function to upload a document
  const uploadDocument = async (file: File) => {
    try {
      const pendingMessage: Message = {
        id: uuidv4(),
        content: `Uploading ${file.name}...`,
        timestamp: new Date().toISOString(),
        role: MessageRole.SYSTEM,
        status: 'sending'
      };
      
      setMessages((prev) => [...prev, pendingMessage]);
      
      const response = await chatApi.uploadDocument(file);
      
      if (response.success) {
        // Remove pending message and add response
        setMessages((prev) => 
          prev.filter((msg) => msg.content !== `Uploading ${file.name}...`)
        );
        setMessages((prev) => [...prev, response.data]);
      } else {
        toast.error(response.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  };
  
  return (
    <ChatContext.Provider
      value={{
        messages,
        loading,
        isTyping,
        sendMessage,
        uploadDocument
      }}
    >
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
