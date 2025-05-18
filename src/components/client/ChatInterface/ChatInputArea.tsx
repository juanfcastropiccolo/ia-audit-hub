
import React, { useRef, useState, useEffect } from 'react';

interface ChatInputAreaProps {
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  sendMessage: () => void;
  handleUploadClick: () => void;
  isLoading: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ 
  currentMessage, 
  setCurrentMessage, 
  sendMessage, 
  handleUploadClick, 
  isLoading,
  onKeyDown
}) => {
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newRows = Math.min(5, Math.max(1, Math.ceil(textareaRef.current.scrollHeight / 24)));
      setRows(newRows);
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentMessage]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
      return;
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentMessage.trim() && !isLoading) {
        sendMessage();
      }
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-end rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-accent">
        <button 
          onClick={handleUploadClick}
          type="button"
          className="p-2 rounded-l hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-500 dark:text-gray-400"
          title="Subir archivo"
          disabled={isLoading}
          aria-label="Subir archivo"
        >
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>
        
        <textarea
          ref={textareaRef}
          value={currentMessage}
          onChange={handleChange}
          onKeyDown={handleKeyDownInternal}
          placeholder="Escribe tu mensaje..."
          className="flex-1 py-2 px-3 bg-transparent border-0 focus:ring-0 resize-none overflow-hidden"
          rows={rows}
          disabled={isLoading}
        />
        
        <button 
          onClick={() => {
            if (currentMessage.trim() && !isLoading) {
              sendMessage();
            }
          }}
          type="button" 
          className={`p-2 rounded-r ${currentMessage.trim() && !isLoading ? 'text-primary dark:text-accent' : 'text-gray-400 dark:text-gray-500'}`}
          disabled={!currentMessage.trim() || isLoading}
          aria-label="Enviar"
        >
          {isLoading ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
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
      </div>
      
      <div className="max-w-4xl mx-auto mt-1.5 text-xs text-gray-400 dark:text-gray-500 text-center">
        <span>AUDIT-IA responde basado en información histórica. Pulsa <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-sans">↵</kbd> para enviar.</span>
      </div>
    </div>
  );
};

export default ChatInputArea;
