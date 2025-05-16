import { useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  sendMessage: () => void;
  handleUploadClick: () => void;
  isLoading: boolean;
}

function ChatInput({ 
  currentMessage, 
  setCurrentMessage, 
  sendMessage, 
  handleUploadClick, 
  isLoading 
}: ChatInputProps) {
  
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentMessage.trim()) {
        sendMessage();
      }
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      sendMessage();
    }
  };

  return (
    <div className="chat-input-container">
      <button 
        onClick={handleUploadClick}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Subir archivo"
        disabled={isLoading}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5 text-gray-600 dark:text-gray-300"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </button>
      
      <form onSubmit={handleSubmit} className="flex-1 flex items-center">
        <textarea
          value={currentMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
          className="chat-input"
          rows={1}
          disabled={isLoading}
          style={{
            resize: 'none',
            height: '40px',
            maxHeight: '120px',
            overflowY: 'auto'
          }}
        />
        
        <button 
          type="submit" 
          className="send-button"
          disabled={!currentMessage.trim() || isLoading}
          title="Enviar mensaje"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-5 h-5"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

export default ChatInput; 