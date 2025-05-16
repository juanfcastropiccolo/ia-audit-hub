
export interface Message {
  id: string;
  text: string;
  role: 'user' | 'client' | 'assistant';
  timestamp: Date | string;
  fileUrl?: string;
  fileName?: string;
  model?: string;
}

export interface ChatHeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  userInfo: { email: string; role: string; name: string; } | null;
}

export interface ChatMessageProps {
  message: Message;
}

export interface ChatInputProps {
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  sendMessage: () => void;
  handleUploadClick: () => void;
  isLoading: boolean;
}

export interface ChatMessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}
