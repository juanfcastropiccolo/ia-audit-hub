import React, { useState } from 'react';
import type { LLMModel } from '../../api/apiService';
import { getSupabaseStorageUrl } from '../../lib/supabaseClient';

interface ChatHeaderProps {
  selectedModel: LLMModel;
  onModelChange: (model: LLMModel) => void;
  userInfo: { email: string; role: string; name: string; } | null;
  onLogout?: () => Promise<void>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  selectedModel, 
  onModelChange,
  userInfo,
  onLogout
}) => {
  const [showModelSelector, setShowModelSelector] = useState(false);
  const clientName = userInfo?.name || 'Cliente Demo';
  const auditStatus = 'En Progreso';
  const logoUrl = getSupabaseStorageUrl('pictures/trimmed_logo.png');

  const handleModelClick = () => {
    setShowModelSelector(!showModelSelector);
  };

  const handleModelSelect = (model: LLMModel) => {
    onModelChange(model);
    setShowModelSelector(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout().catch(err => console.error('Error logging out:', err));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
        <div className="flex items-center">
          <img src={logoUrl} alt="AUDIT-IA Logo" className="h-8 w-auto mr-3" />
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Chat de Auditoría</h1>
            <div className="flex flex-wrap items-center mt-1 text-sm text-gray-600 dark:text-gray-300 space-x-3">
              <p>Cliente: {clientName}</p>
              <div className="flex items-center">
                <span>Estado: </span>
                <span className="flex items-center ml-1">
                  <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                  {auditStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button 
              onClick={handleModelClick}
              className="flex items-center px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="mr-2">Modelo: {getModelDisplayName(selectedModel)}</span>
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            {showModelSelector && (
              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                {['mock', 'gemini', 'claude', 'gpt4'].map((model) => (
                  <button
                    key={model}
                    onClick={() => handleModelSelect(model as LLMModel)}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedModel === model ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    {getModelDisplayName(model as LLMModel)}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {onLogout && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get a user-friendly name for the model
const getModelDisplayName = (model: LLMModel): string => {
  switch (model) {
    case 'gemini': return 'Gemini (Google)';
    case 'claude': return 'Claude (Anthropic)';
    case 'gpt4': return 'GPT-4 (OpenAI)';
    case 'mock': return 'Mock (Simulación)';
    default: return model;
  }
};

export default ChatHeader;
