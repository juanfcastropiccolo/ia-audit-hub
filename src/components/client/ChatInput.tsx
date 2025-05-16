import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

interface ChatInputProps {
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  sendMessage: () => void;
  handleUploadClick: () => void;
  isLoading: boolean;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
}

function ChatInput({ 
  currentMessage, 
  setCurrentMessage, 
  sendMessage, 
  handleUploadClick, 
  isLoading,
  onKeyDown
}: ChatInputProps) {
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      
      // Calculate the number of rows
      const lineHeight = 20; // Approximate line height in pixels
      const newRows = Math.min(5, Math.max(1, Math.ceil(textareaRef.current.scrollHeight / lineHeight)));
      
      setRows(newRows);
      
      // Set the height based on scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentMessage]);
  
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
  };

  const handleKeyDownInternal = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // If an external handler is provided, use it
    if (onKeyDown) {
      onKeyDown(e);
      return;
    }
    
    // Otherwise use the default implementation
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
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3">
      <div className="flex items-end space-x-2">
        <button 
          onClick={handleUploadClick}
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
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
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>
        
        <form onSubmit={handleSubmit} className="flex-1 flex items-end">
          <textarea
            ref={textareaRef}
            value={currentMessage}
            onChange={handleChange}
            onKeyDown={handleKeyDownInternal}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none overflow-hidden"
            rows={rows}
            disabled={isLoading}
            aria-label="Mensaje de texto"
          />
          
          <button 
            type="submit" 
            className="px-4 py-2 h-full rounded-r-lg bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!currentMessage.trim() || isLoading}
            title="Enviar mensaje"
            aria-label="Enviar"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
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
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatInput;
