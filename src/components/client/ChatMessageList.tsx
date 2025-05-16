
import ChatMessage from './ChatMessage';
import type { ChatMessageListProps } from '../../types/chat';

function ChatMessageList({ messages, messagesEndRef }: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 chat-messages-container">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <svg 
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Ningún mensaje aún</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Inicia una conversación con el asistente para comenzar tu auditoría.
            </p>
          </div>
        </div>
      ) : (
        messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ChatMessageList;
