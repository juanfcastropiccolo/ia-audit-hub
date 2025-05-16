
import { v4 as uuidv4 } from 'uuid';

// API URL configuration - Dynamic port detection
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

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
  const { message, clientId, sessionId, modelType } = params;
  // Removed unused agentType parameter
  
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
  
  // Funcionamiento a prueba de fallos - si el backend da error, usar mock
  try {
    // Real API call to the backend
    console.log(`Enviando mensaje al backend (${API_URL}/api/chat)...`);
    
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        client_id: clientId,
        session_id: sessionId,
        model_type: 'gemini', // Forzar siempre gemini para evitar problemas
        agent_type: 'assistant' // Forzar siempre assistant para simplificar
      }),
      // Añadir timeout para evitar esperas infinitas
      signal: AbortSignal.timeout(15000) // 15 segundos máximo
    });

    if (!response.ok) {
      console.error(`Error en la API (${response.status}): ${response.statusText}`);
      // Si hay error, mostrar detalle y caer al fallback
      const errorBody = await response.text();
      throw new Error(`API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return {
      message: data.message || "Lo siento, la respuesta del servidor no contenía un mensaje.",
      sessionId: data.session_id || sessionId || uuidv4(),
      modelUsed: data.model_used || 'gemini'
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_id', clientId);
    formData.append('session_id', sessionId);
    formData.append('model_type', 'gemini'); // Forzar gemini para evitar problemas
    
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      // Añadir timeout para evitar esperas infinitas
      signal: AbortSignal.timeout(30000) // 30 segundos máximo para archivos grandes
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      message: data.message || `Se ha subido el archivo ${file.name}, pero no hay respuesta detallada.`,
      sessionId: data.session_id || sessionId,
      modelUsed: data.model_used || 'gemini'
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
