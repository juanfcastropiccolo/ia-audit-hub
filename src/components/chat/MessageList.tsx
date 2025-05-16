
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Message } from '@/types';
import { SkeletonCard } from '@/components/common/SkeletonLoader';
import ChatBubble from '@/components/chat/ChatBubble';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  isTyping: boolean;
}

export function MessageList({ messages, loading, isTyping }: MessageListProps) {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);
  
  // Show loading UI
  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }
  
  // Show empty state
  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="rounded-full bg-accent/20 p-4 mb-4">
          <svg
            className="h-12 w-12 text-accent"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <p className="text-center text-muted-foreground">
          {t('chat.empty')}
        </p>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-start mb-4">
          <div className="chat-message-assistant px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-75" />
              <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-150" />
            </div>
          </div>
        </div>
      )}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
