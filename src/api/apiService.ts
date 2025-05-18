import { v4 as uuidv4 } from 'uuid';

// API URL configuration - Use the provided env variable or fallback
const RAW_API_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000`;
const API_URL = RAW_API_URL.replace(/\/$/, ''); // Remove trailing slash if present

const RAW_WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000/ws`;
const WS_URL = RAW_WS_URL.replace(/\/$/, ''); // Remove trailing slash if present

// Models available
export type LLMModel = 'gemini' | 'claude' | 'gpt4' | 'mock';

// Interface for sending a message
export interface SendMessageParams {
  message: string;
  clientId: string;
  sessionId?: string;
  modelType: LLMModel;
  agentType?: 'assistant' | 'senior' | 'supervisor' | 'manager' | 'team';
}

// Response structure
export interface MessageResponse {
  message: string;
  sessionId: string;
  modelUsed: string;
}

// API for communicating with LLM models
export const sendMessageToLLM = async (params: SendMessageParams): Promise<MessageResponse> => {
  const { message, clientId, sessionId, modelType, agentType = 'assistant' } = params;
  
  if (modelType === 'mock') {
    // Mock response for testing without backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock responses based on keywords
    const mockResponses: { [key: string]: string } = {
      "hola": "¡Hola! ¿En qué puedo ayudarte con la auditoría hoy?",
      "buenos días": "¡Buenos días! Estoy aquí para asistirte con cualquier consulta sobre la auditoría.",
      "como estas": "Estoy funcionando correctamente. ¿En qué puedo ayudarte con la auditoría?",
      "ayuda": "Puedo ayudarte con información sobre el proceso de auditoría, estado actual, documentos requeridos y resolver dudas específicas.",
      "default": "Entiendo tu consulta. Para proporcionarte información precisa sobre la auditoría, ¿podrías proporcionar más detalles específicos sobre lo que necesitas?"
    };
    
    const lowerText = message.toLowerCase();
    let responseText = mockResponses.default;
    
    for (const [key, value] of Object.entries(mockResponses)) {
      if (lowerText.includes(key)) {
        responseText = value;
        break;
      }
    }

    return {
      message: responseText,
      sessionId: sessionId || uuidv4(),
      modelUsed: 'mock'
    };
  }
  
  // Attempt to use the backend API with fallback to mock responses
  try {
    console.log(`Sending message to backend (${API_URL}/api/chat)...`);
    
    // Set up request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        client_id: clientId,
        session_id: sessionId,
        model_type: modelType,
        agent_type: agentType
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API Error (${response.status}): ${response.statusText}`);
      // Show error details and fall back to mock
      const errorBody = await response.text();
      throw new Error(`API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return {
      message: data.message || "Lo siento, la respuesta del servidor no contenía un mensaje.",
      sessionId: data.session_id || sessionId || uuidv4(),
      modelUsed: data.model_used || modelType
    };
  } catch (error) {
    console.error('Error sending message to LLM:', error);
    
    // Fall back to mock in case of errors
    return {
      message: `[Modo de respaldo activado] Hubo un problema al comunicarse con el servidor. ${error instanceof Error ? error.message : 'Error desconocido'}.\n\nPuedo seguir ayudándote en modo limitado. ¿En qué puedo ayudarte con tu consulta de auditoría?`,
      sessionId: sessionId || uuidv4(),
      modelUsed: 'error_fallback'
    };
  }
};

// Function to upload files
export const uploadFileForAnalysis = async (
  file: File, 
  clientId: string, 
  sessionId: string,
  modelType: LLMModel
): Promise<MessageResponse> => {
  if (modelType === 'mock') {
    // Mock file upload response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      message: `He recibido el archivo "${file.name}". Cuando el backend esté operativo, podré procesar su contenido para el análisis de auditoría.`,
      sessionId,
      modelUsed: 'mock'
    };
  }
  
  try {
    // Set up request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout for large files
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_id', clientId);
    formData.append('session_id', sessionId);
    formData.append('model_type', modelType);
    
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      message: data.message || `Se ha subido el archivo ${file.name}, pero no hay respuesta detallada.`,
      sessionId: data.session_id || sessionId,
      modelUsed: data.model_used || modelType
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Fall back to mock in case of errors
    return {
      message: `[Modo de respaldo] Hubo un problema al procesar el archivo "${file.name}": ${error instanceof Error ? error.message : 'Error desconocido'}`,
      sessionId,
      modelUsed: 'error_fallback'
    };
  }
};

// WebSocket connection for real-time chat features
let socket: WebSocket | null = null;

export const connectWebSocket = (
  clientId: string, 
  sessionId: string, 
  onMessage: (message: any) => void,
  onError: (error: any) => void
) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
  
  try {
    socket = new WebSocket(`${WS_URL}?client_id=${clientId}&session_id=${sessionId}`);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (event) => {
      console.error('WebSocket error:', event);
      onError(event);
    };
    
    socket.onclose = () => {
      console.log('WebSocket closed');
    };
    
    return () => {
      if (socket) {
        socket.close();
        socket = null;
      }
    };
  } catch (error) {
    console.error('Error creating WebSocket connection:', error);
    onError(error);
    return () => {};
  }
};
