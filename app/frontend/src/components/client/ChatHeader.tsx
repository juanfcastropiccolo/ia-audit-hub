import React from 'react';
import type { LLMModel } from '../../api/apiService';

interface ChatHeaderProps {
  selectedModel: LLMModel;
  onModelChange: (model: LLMModel) => void;
  userInfo: { email: string; role: string; name: string; } | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  selectedModel, 
  onModelChange,
  userInfo
}) => {
  const clientName = userInfo?.name || 'Cliente Demo';
  const auditStatus = 'En Progreso';

  return (
    <div className="chat-header">
      <div className="flex flex-col md:flex-row justify-between w-full">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Chat de Auditoría</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Cliente: {clientName}</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Estado: {auditStatus}</p>
        </div>
        <div className="mt-3 md:mt-0 flex flex-col space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Modelo LLM:</div>
          <select 
            className="model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value as LLMModel)}
          >
            <option value="gemini">Gemini (Google)</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="gpt4">GPT-4 (OpenAI)</option>
            <option value="mock">Mock (Prueba)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader; 