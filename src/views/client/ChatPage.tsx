import { useRef, useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ChatHeader from '../../components/client/ChatHeader';
import MessageBubble from '../../components/client/MessageBubble';
import ChatInput from '../../components/client/ChatInput';
import { useTranslation } from 'react-i18next';

function ChatPage() {
  const { t } = useTranslation();
  const { messages, sendMessage, isLoading, error } = useChat();
  const { signOut, user } = useAuth();
  const [currentMessage, setCurrentMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;
    
    try {
      await sendMessage(currentMessage);
      setCurrentMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // File handling code will be implemented in a future update
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('File selected:', file.name);
    
    // Reset the input
    if (e.target) e.target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-soft-background dark:bg-deep-indigo">
      <ChatHeader 
        selectedModel="mock" 
        onModelChange={() => {}} 
        userInfo={{
          email: user?.email || 'user@example.com',
          role: 'client',
          name: localStorage.getItem('userName') || 'Cliente'
        }}
        onLogout={signOut}
      />
      
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex flex-col max-w-4xl mx-auto">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400 p-8 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <h3 className="text-xl font-medium mb-2">{t('welcome')}</h3>
                <p>{t('typing_message')}</p>
              </div>
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
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt"
      />
      
      <ChatInput 
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        sendMessage={handleSendMessage}
        handleUploadClick={handleUploadClick}
        isLoading={isLoading}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default ChatPage;
