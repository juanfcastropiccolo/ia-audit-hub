
import { useRef, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ChatHeader from '../../components/client/ChatHeader';
import MessageBubble from '../../components/client/MessageBubble';
import ChatInput from '../../components/client/ChatInput';
import { useTranslation } from 'react-i18next';

function ChatPage() {
  const { t } = useTranslation();
  const { messages, sendMessage, isLoading } = useChat();
  const { signOut } = useAuth();
  const [currentMessage, setCurrentMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;
    
    try {
      await sendMessage(currentMessage);
      setCurrentMessage('');
      
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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

  return (
    <div className="flex flex-col h-screen bg-soft-background dark:bg-deep-indigo">
      <ChatHeader 
        selectedModel="gemini" 
        onModelChange={() => {}} 
        userInfo={{
          email: 'user@example.com',
          role: 'client',
          name: 'Cliente'
        }}
        onLogout={signOut}
      />
      
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="flex flex-col max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="mb-2">{t('welcome')}</p>
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
      />
    </div>
  );
}

export default ChatPage;
