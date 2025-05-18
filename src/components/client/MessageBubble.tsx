
interface MessageBubbleProps {
  sender: string;
  text: string;
  timestamp?: Date;
}

function MessageBubble({ sender, text, timestamp }: MessageBubbleProps) {
  const isUser = sender === 'client';
  
  // Styling classes based on sender
  const containerClasses = isUser 
    ? "self-end max-w-[80%]" 
    : "self-start max-w-[80%]";
    
  const bubbleClasses = isUser 
    ? "bg-primary text-white rounded-2xl rounded-br-sm" 
    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-sm";
    
  return (
    <div className={containerClasses}>
      <div className={`px-4 py-2 shadow-sm ${bubbleClasses}`}>
        <div className="whitespace-pre-wrap break-words text-sm">{text}</div>
        {timestamp && (
          <div className="text-xs opacity-70 text-right mt-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
