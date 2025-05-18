
import React, { useRef, useEffect } from 'react';
import MessageBubble from '../MessageBubble';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  user_id?: string;
  sender: string;
  message: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-20">
      <div className="flex flex-col max-w-4xl mx-auto">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
            <h3 className="text-2xl font-medium mb-4 text-gray-700 dark:text-gray-300">
              {t('welcome')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {t('typing_message')}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'client' ? 'items-end' : 'items-start'} mb-4`}
            >
              <MessageBubble 
                sender={msg.sender} 
                text={msg.message}
                timestamp={new Date(msg.timestamp)}
              />
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
