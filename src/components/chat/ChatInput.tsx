
import { FormEvent, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Paperclip, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onUploadFile: (file: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onUploadFile, disabled = false }: ChatInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUploadFile(files[0]);
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
      />
      
      {/* File upload button */}
      <button
        type="button"
        onClick={triggerFileInput}
        className="p-2 rounded-full hover:bg-primary/10 dark:hover:bg-accent/10 transition-colors"
        disabled={disabled}
        aria-label={t('chat.upload')}
      >
        <Paperclip className="h-5 w-5" />
      </button>
      
      {/* Message input */}
      <div className="flex-1 input-container">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.placeholder')}
          className="w-full p-3 bg-transparent resize-none focus:outline-none min-h-[40px] max-h-[120px]"
          disabled={disabled}
          rows={1}
        />
      </div>
      
      {/* Send button */}
      <button
        type="submit"
        className={`p-3 rounded-full ${
          message.trim() && !disabled
            ? 'bg-accent text-accent-foreground hover:bg-accent/90'
            : 'bg-accent/50 text-accent-foreground/50 cursor-not-allowed'
        } transition-colors`}
        disabled={!message.trim() || disabled}
        aria-label={t('chat.send')}
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  );
}

export default ChatInput;
