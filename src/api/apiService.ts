
import { Client, Message, MessageRole, User, ApiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@audit-ia.com',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Client User',
    email: 'client@example.com',
    role: 'client'
  }
];

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

// Mock authentication API
export const mockAuthApi = {
  // Login function
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay(1000);
    
    // Simple mock validation
    if (email === 'admin@audit-ia.com' && password === 'admin') {
      return {
        success: true,
        data: {
          user: mockUsers[0],
          token: 'mock-admin-token-12345'
        }
      };
    } else if (email === 'client@example.com' && password === 'client') {
      return {
        success: true,
        data: {
          user: mockUsers[1],
          token: 'mock-client-token-67890'
        }
      };
    } else {
      return {
        success: false,
        data: { user: null, token: '' },
        message: 'Credenciales inválidas'
      };
    }
  },
  
  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    await delay(500);
    
    // In a real app, we would validate the token and return the corresponding user
    // For this mock, we'll just return the admin user
    return {
      success: true,
      data: mockUsers[0]
    };
  },
  
  // Logout function
  logout: async (): Promise<ApiResponse<null>> => {
    await delay(300);
    
    return {
      success: true,
      data: null
    };
  }
};

// Mock client API functions
export const mockClientApi = {
  // Get all clients
  getClients: async (): Promise<ApiResponse<Client[]>> => {
    await delay(800);
    return {
      success: true,
      data: mockClients
    };
  },
  
  // Get client by ID
  getClient: async (id: string): Promise<ApiResponse<Client>> => {
    await delay(500);
    const client = mockClients.find(c => c.id === id);
    
    if (!client) {
      return {
        success: false,
        data: {} as Client,
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
  getChatHistory: async (): Promise<ApiResponse<Message[]>> => {
    await delay(1000);
    return {
      success: true,
      data: [...mockMessages]
    };
  },
  
  // Send a message
  sendMessage: async (content: string): Promise<ApiResponse<Message>> => {
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
  uploadDocument: async (file: File): Promise<ApiResponse<Message>> => {
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
