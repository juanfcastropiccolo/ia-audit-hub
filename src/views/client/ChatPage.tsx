import { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import type { ApiLLMModel, FrontendLLMModel } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Mic, ChevronDown, LogOut } from 'lucide-react';

// API models available for selection by the user
const AVAILABLE_API_MODELS: ApiLLMModel[] = ['gemini', 'claude', 'gpt4', 'mock'];

// Helpers
const getModelDisplayName = (model: FrontendLLMModel): string => {
  switch(model) {
    case 'mock': return 'Demo';
    case 'gemini': return 'Gemini Pro';
    case 'claude': return 'Claude 3';
    case 'gpt4': return 'GPT-4 Turbo';
    case 'assistant': return 'Asistente';
    case 'system': return 'Sistema';
    case 'error': return 'Error';
    case 'error_fallback': return 'Respaldo';
    default:
      const exhaustiveCheck: never = model;
      return 'Desconocido';
  }
};

// ActionChip component for quick action buttons
const ActionChip = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-gray-700/50 text-gray-200 hover:bg-gray-700 transition-all duration-150 hover:scale-105"
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

// Component for message attachments
const MessageAttachment = ({ fileName, fileUrl, fileType }: { fileName?: string; fileUrl?: string; fileType?: string }) => {
  if (!fileName || !fileUrl) return null;
  
  const isImage = fileType?.startsWith('image/');
  
  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-gray-600">
      {isImage ? (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <img src={fileUrl} alt={fileName} className="max-h-48 max-w-full object-contain" />
        </a>
      ) : (
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-3 bg-gray-700/30 flex items-center hover:bg-gray-700/50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          <div className="overflow-hidden">
            <span className="block truncate text-sm font-medium text-gray-200">{fileName}</span>
            <span className="text-xs text-gray-400">Descargar archivo</span>
          </div>
        </a>
      )}
    </div>
  );
};

// FilePreview component for displaying selected files before upload
const FilePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="mt-2 p-2 bg-gray-700/70 rounded-lg flex items-center">
      <div className="flex-1 flex items-center overflow-hidden">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        <span className="truncate text-sm text-gray-200">{file.name}</span>
        <span className="ml-2 text-xs text-gray-400">{formatFileSize(file.size)}</span>
      </div>
      <button 
        onClick={onRemove}
        className="ml-2 p-1 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-600"
        aria-label="Eliminar archivo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// ChatHeader component with functional model selector
const ChatHeader = ({
  selectedApiModel,
  onApiModelChange,
  onLogout
}: {
  selectedApiModel: ApiLLMModel;
  onApiModelChange: (model: ApiLLMModel) => void;
  onLogout: () => void;
}) => {
  const [showModelSelector, setShowModelSelector] = useState(false);

  return (
    <div className="bg-primary border-b border-indigo p-3 z-20 sticky top-0">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Asistente de Auditoría IA</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-gray-600 text-gray-200 hover:bg-gray-700 transition-all"
            >
              <span>Modelo: {getModelDisplayName(selectedApiModel)}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showModelSelector && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-700 shadow-xl rounded-md border border-gray-600 overflow-hidden z-30">
                {AVAILABLE_API_MODELS.map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      onApiModelChange(model);
                      setShowModelSelector(false);
                    }}
                  className={`block w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-600 transition-colors ${
                      selectedApiModel === model ? 'bg-primary font-semibold' : ''
                    }`}
                  >
                    {getModelDisplayName(model)}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Main ChatPage component
function ChatPage() {
  const {
    messages,
    sendMessage,
    uploadFileToStorage,
    isLoading,
    error,
    currentModel,
    setCurrentModel,
    startAudit
  } = useChat();
  const { signOut } = useAuth();
  const [currentMessage, setCurrentMessage] = useState('');
  const inputRef = useRef(null as HTMLInputElement | null);
  const fileInputRef = useRef(null as HTMLInputElement | null);
  const messagesEndRef = useRef(null as HTMLDivElement | null);
  const [selectedFile, setSelectedFile] = useState(null as File | null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showAuditConfirm, setShowAuditConfirm] = useState(false);

  // Summary counts for confirmation modal
  const attachedFilesCount = messages.filter(msg => msg.fileName).length;
  const clientMessagesCount = messages.filter(msg => msg.sender === 'client').length;
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading, messages, error]);
  
  const handleModelChange = (model: ApiLLMModel) => {
    setCurrentModel(model);
    console.log(`ChatPage: Model changed to: ${getModelDisplayName(model)}`);
  };
  
  const handleSendMessage = async () => {
    if (isLoading || (!currentMessage.trim() && !selectedFile)) return;
    
    try {
      await sendMessage(currentMessage, currentModel, selectedFile || undefined);
      setCurrentMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('ChatPage: Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    if (e.target) e.target.value = '';
  };
  
  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileInfoForDisplay(null);
  };
  
  const handleConfirmStartAudit = async () => {
    setShowAuditConfirm(false);
    try {
      await startAudit();
    } catch (_) {
      // Error is handled in context
    }
  };

  // Prepare list of uploaded files from user messages
  const uploadedFiles = Array.from(
    new Map(
      messages
        .filter(m => m.sender === 'client' && m.fileUrl)
        .map(m => [m.fileUrl, { fileName: m.fileName, fileUrl: m.fileUrl, fileType: m.fileType }])
    ).values()
  );
  return (
    <div className="flex h-screen bg-deep-indigo text-white">
      {/* Sidebar: Uploaded Documents */}
      <aside className="hidden lg:flex flex-col w-80 bg-primary border-r border-indigo">
        <div className="px-4 py-3 font-semibold text-white">Documents</div>
        <div className="flex-grow overflow-y-auto px-4 space-y-2">
          {uploadedFiles.length > 0 ? (
            uploadedFiles.map((f, idx) => (
              <MessageAttachment
                key={idx}
                fileName={f.fileName}
                fileUrl={f.fileUrl}
                fileType={f.fileType}
              />
            ))
          ) : (
            <p className="text-gray-300 text-sm text-center mt-4">No documents uploaded.</p>
          )}
        </div>
        <div className="px-4 py-3">
          <button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="w-full py-2 bg-secondary text-deep-indigo font-medium rounded hover:bg-accent transition-colors disabled:opacity-50"
          >
            Upload Document
          </button>
        </div>
      </aside>
      {/* Main Chat Area */}
      <div className="flex flex-col flex-grow">
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Confirmation modal for starting audit */}
      {showAuditConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">Confirmar inicio de auditoría</h2>
            <p className="mb-4">Resumen del contexto recopilado:</p>
            <ul className="list-disc list-inside text-sm mb-4">
              <li>{`Mensajes del cliente: ${clientMessagesCount}`}</li>
              <li>{`Archivos adjuntos: ${attachedFilesCount}`}</li>
            </ul>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAuditConfirm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStartAudit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                Iniciar
              </button>
            </div>
          </div>
        </div>
      )}
      <ChatHeader 
        selectedApiModel={currentModel}
        onApiModelChange={handleModelChange} 
        onLogout={signOut}
      />
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,application/zip,application/x-zip-compressed"
      />
      
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 max-w-md w-full bg-red-600/90 text-white p-3 rounded-lg shadow-lg backdrop-blur-sm text-sm z-50 flex items-center justify-between">
          <p>{error}</p>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length > 0 ? (
            <div className="max-w-4xl mx-auto w-full">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex mb-3 ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] sm:max-w-[70%] rounded-xl px-4 py-2.5 shadow ${
                      msg.sender === 'client'
                        ? 'bg-primary text-white rounded-br-none'
                        : msg.sender === 'system' 
                        ? 'bg-yellow-500/20 text-yellow-200 text-xs italic border border-yellow-500/30 self-center mx-auto text-center px-3 py-1.5'
                        : 'bg-gray-700 text-gray-100 rounded-bl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.message}</div>
                    
                    {(msg.fileName || msg.fileUrl) && msg.sender !== 'system' && (
                      <MessageAttachment 
                        fileName={msg.fileName} 
                        fileUrl={msg.fileUrl} 
                        fileType={msg.fileType} 
                      />
                    )}
                    
                    {msg.sender !== 'system' && (
                        <div className="flex items-center justify-end mt-1.5 text-xs opacity-60">
                        {msg.model && (
                            <span className="mr-2 opacity-80">{getModelDisplayName(msg.model)}</span>
                        )}
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <svg className="w-24 h-24 mb-6 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
              <h2 className="text-2xl font-semibold mb-2">Listo para ayudar.</h2>
              <p className="max-w-sm">Escribe tu consulta o adjunta un archivo para comenzar con la auditoría.</p>
            </div>
          )}
        </div>
        
        <div className="px-4 pt-3 pb-4 border-t border-gray-700/60 bg-gray-900">
          {/* Button to start the full audit process */}
          <div className="flex justify-end mb-2">
            <button
              onClick={() => setShowAuditConfirm(true)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              aria-label="Iniciar auditoría"
            >
              Iniciar Auditoría
            </button>
          </div>
          <div className="relative w-full max-w-3xl mx-auto">
            {selectedFile && (
              <FilePreview 
                file={selectedFile} 
                onRemove={handleFileRemove} 
              />
            )}
            
            <div className={`relative flex items-center w-full bg-deep-indigo border ${isInputFocused ? 'border-secondary shadow-lg' : 'border-indigo'} rounded-xl overflow-hidden transition-all`}>
              <button 
                onClick={handleUploadClick} 
                className={`p-3 ${isLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/70'} transition-colors`}
                aria-label="Adjuntar archivo"
                disabled={isLoading}
              >
                <Plus className="w-5 h-5" />
              </button>
              
              <input
                ref={inputRef}
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Escribe tu mensaje o pregunta sobre auditoría..."
                className="flex-1 bg-transparent border-0 outline-none px-1 py-3.5 focus:ring-0 text-gray-100 placeholder-gray-500 text-sm"
                disabled={isLoading}
              />
              
              <div className="flex items-center justify-end gap-1 p-2">
                <button
                  className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-gray-700/70"
                  aria-label="Más opciones"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                  </svg>
                </button>
                
                <button 
                  className="p-2 text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-gray-700/70"
                  aria-label="Entrada de voz"
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={(!currentMessage.trim() && !selectedFile) || isLoading}
                  className={`p-2.5 text-white rounded-lg transition-all ml-1 ${
                    (currentMessage.trim() || selectedFile) && !isLoading 
                  ? 'bg-primary hover:bg-secondary shadow-md' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Enviar mensaje"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
  );
}

export default ChatPage;
