
import { ApiResponse, Client, Message, User } from '@/types';

// Base URL for API
const API_BASE_URL = '/api';

// Helper for HTTP requests
async function fetchAPI<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('audit-ia-token');
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...(data ? { body: JSON.stringify(data) } : {})
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('API request error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error', data: {} as T };
  }
}

// Auth API calls
export const authApi = {
  login: (email: string, password: string) => 
    fetchAPI<{user: User, token: string}>('/auth/login', 'POST', { email, password }),
  
  logout: () => 
    fetchAPI('/auth/logout', 'POST'),
  
  getProfile: () => 
    fetchAPI<User>('/auth/me')
};

// Client API calls (admin)
export const clientApi = {
  getClients: () => 
    fetchAPI<Client[]>('/admin/clients'),
  
  getClientById: (id: string) => 
    fetchAPI<Client>(`/admin/clients/${id}`),
};

// Chat API calls (client)
export const chatApi = {
  getMessages: () => 
    fetchAPI<Message[]>('/chat/messages'),
  
  sendMessage: (content: string) => 
    fetchAPI<Message>('/chat/messages', 'POST', { content }),
  
  uploadDocument: async (file: File) => {
    const token = localStorage.getItem('audit-ia-token');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error', 
        data: {} as Message 
      };
    }
  }
};

// Mock functions for development (remove in production)
export const mockAuthApi = {
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple mock authentication
    if (email === 'admin@example.com' && password === 'password') {
      const user: User = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };
      localStorage.setItem('audit-ia-user', JSON.stringify(user));
      localStorage.setItem('audit-ia-token', 'mock-token-admin');
      return { success: true, data: { user, token: 'mock-token-admin' } };
    } 
    else if (email === 'client@example.com' && password === 'password') {
      const user: User = {
        id: '2',
        name: 'Client User',
        email: 'client@example.com',
        role: 'client'
      };
      localStorage.setItem('audit-ia-user', JSON.stringify(user));
      localStorage.setItem('audit-ia-token', 'mock-token-client');
      return { success: true, data: { user, token: 'mock-token-client' } };
    }
    
    return { 
      success: false, 
      message: 'Invalid credentials', 
      data: {} as {user: User, token: string} 
    };
  },
  
  logout: async () => {
    localStorage.removeItem('audit-ia-user');
    localStorage.removeItem('audit-ia-token');
    return { success: true, data: {} };
  },
  
  getProfile: async () => {
    const userStr = localStorage.getItem('audit-ia-user');
    if (!userStr) {
      return { success: false, message: 'Not authenticated', data: {} as User };
    }
    
    return { success: true, data: JSON.parse(userStr) as User };
  }
};

// Mock client API
export const mockClientApi = {
  getClients: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'Empresa ABC',
        company: 'ABC Corporation',
        lastActive: new Date().toISOString(),
        status: 'active'
      },
      {
        id: '2',
        name: 'Finanzas XYZ',
        company: 'XYZ Financial',
        lastActive: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'active'
      },
      {
        id: '3',
        name: 'Seguros Global',
        company: 'Global Insurance',
        lastActive: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'inactive'
      },
      {
        id: '4',
        name: 'Tecnología Avanzada',
        company: 'Advanced Tech',
        lastActive: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: 'active'
      }
    ];
    
    return { success: true, data: mockClients };
  },
  
  getClientById: async (id: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const client: Client = {
      id,
      name: `Client ${id}`,
      company: `Company ${id}`,
      lastActive: new Date().toISOString(),
      status: 'active'
    };
    
    return { success: true, data: client };
  }
};

// Mock chat API
export const mockChatApi = {
  getMessages: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockMessages: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: '¡Hola! Soy el Asistente de Auditoría. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    
    return { success: true, data: mockMessages };
  },
  
  sendMessage: async (content: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `He recibido tu mensaje: "${content}". El equipo de auditoría está analizando tu caso.`,
      timestamp: new Date().toISOString()
    };
    
    return { success: true, data: newMessage };
  },
  
  uploadDocument: async (file: File) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `Documento "${file.name}" recibido. El equipo de auditoría analizará este documento.`,
      timestamp: new Date().toISOString()
    };
    
    return { success: true, data: newMessage };
  }
};
