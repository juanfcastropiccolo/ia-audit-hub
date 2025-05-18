import { useRef, useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import type { LLMModel } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

// Función para obtener el nombre de visualización del modelo
const getModelDisplayName = (model: LLMModel): string => {
  switch(model) {
    case 'mock': return 'Demo';
    case 'gemini': return 'Gemini';
    case 'claude': return 'Claude';
    case 'gpt4': return 'GPT-4';
    default: return 'Desconocido';
  }
};

// ActionChip component for reusable action buttons
const ActionChip = ({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full bg-gray-700/50 text-gray-200 hover:bg-gray-700 transition-all duration-150 hover:scale-105 hover:ring-1 hover:ring-gray-500"
      aria-label={label}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

// Componente de Header con selector de modelos
const ChatHeader = ({ 
  selectedModel, 
  onModelChange,
  onLogout
}: { 
  selectedModel: LLMModel; 
  onModelChange: (model: LLMModel) => void;
  onLogout: () => void;
}) => {
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  return (
    <div className="w-full bg-gray-800 border-b border-gray-700 p-3 z-10">
      <div className="max-w-[600px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-semibold text-white">Audit AI</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button 
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded border border-gray-600 text-gray-200 hover:bg-gray-700 transition-all"
            >
              <span>Modelo: {getModelDisplayName(selectedModel)}</span>
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
              <div className="absolute right-0 mt-1 bg-gray-700 shadow-lg rounded-md border border-gray-600 overflow-hidden z-10">
                {['mock', 'gemini', 'claude', 'gpt4'].map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      onModelChange(model as LLMModel);
                      setShowModelSelector(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-600 ${selectedModel === model ? 'bg-gray-600' : ''}`}
                  >
                    {getModelDisplayName(model as LLMModel)}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={onLogout}
            className="p-1.5 rounded-full text-gray-300 hover:bg-gray-700"
            aria-label="Cerrar sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente FilePreview para mostrar vista previa del archivo seleccionado
const FilePreview = ({ 
  file, 
  onRemove 
}: { 
  file: File; 
  onRemove: () => void;
}) => {
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

// Utilidad para formatear el tamaño de archivo
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Componente para renderizar archivos adjuntos en mensajes
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

function ChatPage() {
  const { messages, sendMessage, uploadFile, isLoading, error } = useChat();
  const { signOut } = useAuth();
  const [currentMessage, setCurrentMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedModel, setSelectedModel] = useState<LLMModel>('mock');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ fileName: string; fileUrl: string; fileType: string } | null>(null);
  
  // Auto-scroll a mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Función para cambiar de modelo
  const handleModelChange = (model: LLMModel) => {
    setSelectedModel(model);
    // Enviar un mensaje de sistema informando del cambio de modelo
    const systemMessage = `Has cambiado al modelo ${getModelDisplayName(model)}. Las respuestas ahora utilizarán este modelo.`;
    console.log(systemMessage);
  };
  
  const handleSendMessage = async () => {
    if ((!currentMessage.trim() && !fileInfo) || isLoading) return;
    
    try {
      // Pasar el modelo seleccionado al enviar el mensaje y la info del archivo si existe
      await sendMessage(
        currentMessage, 
        selectedModel, 
        fileInfo || undefined
      );
      setCurrentMessage('');
      setSelectedFile(null);
      setFileInfo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
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
    
    // Mostrar el archivo seleccionado en la UI
    setSelectedFile(file);
    
    // Subir el archivo a Supabase y obtener la URL
    try {
      const result = await uploadFile(file);
      if (result) {
        setFileInfo(result);
      } else {
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setSelectedFile(null);
    }
    
    // Reset el input
    if (e.target) e.target.value = '';
  };
  
  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileInfo(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <ChatHeader 
        selectedModel={selectedModel}
        onModelChange={handleModelChange}
        onLogout={signOut}
      />
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
      />
      
      {error && (
        <div className="absolute top-14 left-0 right-0 mx-auto max-w-md bg-red-500/80 text-white p-3 rounded-lg backdrop-blur-sm text-sm z-50">
          <p>{error}</p>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 ${
                      msg.sender === 'client'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-gray-700 text-gray-100 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.message}</div>
                    
                    {/* Mostrar archivo adjunto si existe */}
                    <MessageAttachment 
                      fileName={msg.fileName} 
                      fileUrl={msg.fileUrl} 
                      fileType={msg.fileType} 
                    />
                    
                    <div className="flex justify-between mt-1 text-xs opacity-75">
                      {msg.model && (
                        <span className="text-xs opacity-70">{msg.model}</span>
                      )}
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <h2 className="text-2xl font-bold mb-4">Ready when you are.</h2>
                <p>Envía un mensaje para comenzar una conversación</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Input para enviar mensaje */}
        <div className="px-4 py-4 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-[600px]">
            {/* Preview de archivo si hay seleccionado */}
            {selectedFile && (
              <FilePreview 
                file={selectedFile} 
                onRemove={handleFileRemove} 
              />
            )}
            
            <div className="relative flex items-center w-full bg-gray-800/50 border border-gray-700/60 rounded-lg backdrop-blur-sm overflow-hidden">
              <button 
                onClick={handleUploadClick} 
                className={`p-3 ${isLoading ? 'text-gray-600' : 'text-gray-400 hover:text-gray-200'} transition-colors`}
                aria-label="Upload attachment"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              </button>
              
              <input
                ref={inputRef}
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything"
                className="w-full bg-transparent border-0 outline-none px-2 py-3 focus:ring-2 focus:ring-gray-500/50 text-gray-200"
                disabled={isLoading}
                autoFocus
              />
              
              <div className="flex flex-wrap items-center justify-end gap-2 p-2 md:justify-end sm:justify-center">
                <ActionChip icon="🌐" label="Search" />
                <ActionChip icon="🖼" label="Create image" />
                <button
                  className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-gray-700/70"
                  aria-label="More options"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                  </svg>
                </button>
                <button 
                  className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded-full hover:bg-gray-700/70"
                  aria-label="Voice input"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
                    <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
                  </svg>
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={(!currentMessage.trim() && !fileInfo) || isLoading}
                  className={`p-1.5 text-white rounded-full ${(currentMessage.trim() || fileInfo) && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 text-gray-400'} transition-colors ml-1`}
                  aria-label="Send message"
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
  );
}

export default ChatPage;
