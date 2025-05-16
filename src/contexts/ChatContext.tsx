
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export type Message = {
  id: string;
  user_id: string;
  sender: 'client' | 'assistant' | 'senior' | 'supervisor' | 'manager';
  message: string;
  timestamp: string;
};

type ChatContextType = {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let subscription: any;

    const fetchMessages = async () => {
      if (!user) {
        setMessages([]);
        return;
      }

      setIsLoading(true);
      
      // Fetch existing messages
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }

      setIsLoading(false);

      // Set up real-time subscription for new messages
      subscription = supabase
        .channel('messages-channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `user_id=eq.${user.id}` },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages(prev => 
              prev.some(m => m.id === newMessage.id) 
                ? prev 
                : [...prev, newMessage]
            );
          }
        )
        .subscribe();
    };

    fetchMessages();

    // Cleanup subscription on unmount or user change
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  const sendMessage = async (text: string) => {
    if (!user || !text.trim()) return;

    // Optimistically add message to UI
    const optimisticId = uuidv4();
    const optimisticMessage: Message = {
      id: optimisticId,
      user_id: user.id,
      sender: 'client',
      message: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMessage]);

    // Send to Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        sender: 'client',
        message: text,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticId));
      return;
    }

    // Replace optimistic message with actual one from server
    if (data) {
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticId ? data : msg
      ));
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isLoading }}>
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
