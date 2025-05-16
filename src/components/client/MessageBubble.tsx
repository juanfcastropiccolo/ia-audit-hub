interface MessageBubbleProps {
  sender: string;
  text: string;
  timestamp?: Date;
}

function MessageBubble({ sender, text, timestamp }: MessageBubbleProps) {
  const isUser = sender === 'client';
  
  const bubbleClasses = isUser 
    ? 'bg-indigo text-white self-end rounded-t-lg rounded-bl-lg' 
    : 'bg-lavender text-gray-900 self-start rounded-t-lg rounded-br-lg';
    
  return (
    <div className={`max-w-[80%] px-4 py-2 shadow-sm mb-2 ${bubbleClasses}`}>
      <div className="whitespace-pre-wrap break-words">{text}</div>
      {timestamp && (
        <div className="text-xs opacity-70 text-right mt-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}

export default MessageBubble;
