
import { useRef, useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Importar los componentes nuevos
import ChatHeader from '../../components/client/ChatInterface/ChatHeader';
import ChatMessages from '../../components/client/ChatInterface/ChatMessages';
import ChatInputArea from '../../components/client/ChatInterface/ChatInputArea';

function ChatPage() {
  const { t } = useTranslation();
  const { messages, sendMessage, isLoading, error } = useChat();
  const { signOut, user } = useAuth();
  const [currentMessage, setCurrentMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedModel, setSelectedModel] = useState<'mock' | 'gemini' | 'claude' | 'gpt4'>('mock');

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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <ChatHeader 
        selectedModel={selectedModel} 
        onModelChange={setSelectedModel} 
        userInfo={{
          email: user?.email || 'user@example.com',
          role: 'client',
          name: localStorage.getItem('userName') || 'Cliente'
        }}
        onLogout={signOut}
      />
      
      <div className="relative flex-1 overflow-hidden">
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 z-10">
            <p>{error}</p>
          </div>
        )}
        
        <ChatMessages 
          messages={messages} 
          isLoading={isLoading} 
        />
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt"
        />
        
        <ChatInputArea 
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          sendMessage={handleSendMessage}
          handleUploadClick={handleUploadClick}
          isLoading={isLoading}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}

export default ChatPage;
