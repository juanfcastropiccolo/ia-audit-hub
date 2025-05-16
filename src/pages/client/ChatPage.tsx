
import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@/contexts/ChatContext';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';

export function ChatPage() {
  const { t } = useTranslation();
  const { messages, loading, sendMessage, uploadDocument, isTyping } = useChat();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ensure chat fills available height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;
        const windowHeight = window.innerHeight;
        containerRef.current.style.height = `${windowHeight - headerHeight - 16}px`;
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="flex flex-col card-container overflow-hidden"
    >
      {/* Chat header */}
      <div className="p-4 border-b border-border bg-primary/5">
        <h1 className="text-lg font-medium">Asistente de Auditoría</h1>
        <p className="text-sm text-muted-foreground">
          Sube documentos o realiza preguntas sobre tu auditoría
        </p>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4">
        <MessageList 
          messages={messages}
          loading={loading}
          isTyping={isTyping}
        />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-border bg-background">
        <ChatInput 
          onSendMessage={sendMessage}
          onUploadFile={uploadDocument}
          disabled={loading}
        />
      </div>
    </div>
  );
}

export default ChatPage;
