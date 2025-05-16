
import { Message, MessageRole } from '@/types';
import { format } from 'date-fns';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === MessageRole.USER;
  const isSystem = message.role === MessageRole.SYSTEM;
  
  // Format the timestamp
  const formattedTime = format(new Date(message.timestamp), 'HH:mm');
  
  // Determine user or assistant bubble class
  const bubbleClass = isUser 
    ? 'chat-message-user' 
    : isSystem
      ? 'bg-accent/10 mx-auto text-center'
      : 'chat-message-assistant';
  
  // Role label for assistant messages
  const roleLabelMap: Record<string, string> = {
    [MessageRole.ASSISTANT]: 'Asistente',
    [MessageRole.SENIOR]: 'Auditor Senior',
    [MessageRole.MANAGER]: 'Gerente',
    [MessageRole.SYSTEM]: 'Sistema'
  };
  
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}>
      {/* Role label for non-user messages */}
      {!isUser && !isSystem && (
        <span className="text-xs text-muted-foreground ml-2 mb-1">
          {roleLabelMap[message.role] || message.role}
        </span>
      )}
      
      {/* Message content */}
      <div className={`px-4 py-2 max-w-[80%] ${bubbleClass}`}>
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
      
      {/* Timestamp */}
      <span className="text-xs text-muted-foreground mx-2 mt-1">
        {formattedTime}
        {message.status === 'sending' && ' • Enviando...'}
        {message.status === 'error' && ' • Error'}
      </span>
    </div>
  );
}

export default ChatBubble;
