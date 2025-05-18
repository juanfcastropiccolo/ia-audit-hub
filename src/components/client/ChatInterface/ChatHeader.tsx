
import React from 'react';
import { getSupabaseStorageUrl } from '../../../lib/supabaseClient';
import type { LLMModel } from '../../../api/apiService';

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
  const [showModelSelector, setShowModelSelector] = React.useState(false);
  const clientName = userInfo?.name || 'Cliente Demo';
  const logoUrl = getSupabaseStorageUrl('pictures/trimmed_logo.png');

  const handleModelClick = () => {
    setShowModelSelector(!showModelSelector);
  };

  const handleModelSelect = (model: LLMModel) => {
    onModelChange(model);
    setShowModelSelector(false);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={logoUrl} alt="AUDIT-IA Logo" className="h-8 w-auto" />
          <div className="hidden sm:block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {clientName}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button 
              onClick={handleModelClick}
              className="flex items-center px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="mr-1">{getModelDisplayName(selectedModel)}</span>
              <svg
                className="w-3 h-3"
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
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedModel === model ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    {getModelDisplayName(model as LLMModel)}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
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
    case 'gemini': return 'Gemini';
    case 'claude': return 'Claude';
    case 'gpt4': return 'GPT-4';
    case 'mock': return 'Demo';
    default: return model;
  }
};

export default ChatHeader;
