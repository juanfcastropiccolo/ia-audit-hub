
import { Client, Message, MessageRole } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock client data for demonstration
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    company: 'Constructora XYZ',
    lastActive: '2023-05-15T10:30:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'María Rodríguez',
    company: 'Restaurantes ABC',
    lastActive: '2023-05-14T15:45:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Carlos Gómez',
    company: 'Transportes Rápidos',
    lastActive: '2023-05-10T09:15:00Z',
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Ana Torres',
    company: 'Consultora Legal',
    lastActive: '2023-05-16T11:20:00Z',
    status: 'active'
  }
];

// Mock chat messages for demonstration
const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Bienvenido a su auditoría. ¿En qué puedo ayudarle hoy?',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    role: MessageRole.ASSISTANT,
    status: 'delivered'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock client API functions
export const mockClientApi = {
  // Get all clients
  getClients: async () => {
    await delay(800);
    return {
      success: true,
      data: mockClients
    };
  },
  
  // Get client by ID
  getClient: async (id: string) => {
    await delay(500);
    const client = mockClients.find(c => c.id === id);
    
    if (!client) {
      return {
        success: false,
        message: 'Client not found'
      };
    }
    
    return {
      success: true,
      data: client
    };
  }
};

// Mock chat API functions
export const mockChatApi = {
  // Get chat history
  getChatHistory: async () => {
    await delay(1000);
    return {
      success: true,
      data: [...mockMessages]
    };
  },
  
  // Send a message
  sendMessage: async (content: string) => {
    await delay(500);
    
    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      content,
      timestamp: new Date().toISOString(),
      role: MessageRole.USER,
      status: 'delivered'
    };
    
    mockMessages.push(userMessage);
    
    // Simulate AI response after a delay
    await delay(1500);
    
    // Generate AI response based on user message
    let responseContent = '';
    
    if (content.toLowerCase().includes('informe') || content.toLowerCase().includes('reporte')) {
      responseContent = 'Puedo ayudarle a preparar un informe. ¿Qué tipo de información necesita incluir?';
    } else if (content.toLowerCase().includes('impuesto') || content.toLowerCase().includes('fiscal')) {
      responseContent = 'Las consideraciones fiscales son importantes. Según la normativa vigente, debería considerar estos aspectos principales: deducibilidad, IVA, retenciones y documentación soporte.';
    } else if (content.toLowerCase().includes('ayuda') || content.toLowerCase().includes('help')) {
      responseContent = 'Estoy aquí para ayudarle con su auditoría. Puede preguntarme sobre preparación de informes, cumplimiento normativo, análisis de datos o cualquier otra consulta relacionada.';
    } else {
      responseContent = 'Entiendo su consulta. Déjeme analizar esta información con nuestro equipo de auditoría y le proporcionaré una respuesta detallada.';
    }
    
    // Create assistant response
    const assistantMessage: Message = {
      id: uuidv4(),
      content: responseContent,
      timestamp: new Date().toISOString(),
      role: MessageRole.ASSISTANT,
      status: 'delivered'
    };
    
    mockMessages.push(assistantMessage);
    
    return {
      success: true,
      data: assistantMessage
    };
  },
  
  // Upload a document
  uploadDocument: async (file: File) => {
    await delay(2000);
    
    const systemMessage: Message = {
      id: uuidv4(),
      content: `Documento "${file.name}" recibido y procesado. Tamaño: ${(file.size / 1024).toFixed(2)} KB.`,
      timestamp: new Date().toISOString(),
      role: MessageRole.SYSTEM,
      status: 'delivered'
    };
    
    mockMessages.push(systemMessage);
    
    return {
      success: true,
      data: systemMessage
    };
  }
};
