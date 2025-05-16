import type { Session, AuditTeam, AuditEvent } from '../types';
import io from 'socket.io-client';

// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';

// Socket.io connection
let socket: any = null;

export const connectSocket = (clientId: string, onEventCallback: (event: AuditEvent) => void) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      query: { clientId }
    });

    socket.on('audit_event', (eventData: AuditEvent) => {
      onEventCallback(eventData);
    });

    socket.on('connect', () => {
      console.log('Socket connected!');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected!');
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// API para chat con el asistente
export const sendMessageToAssistant = async (message: string, clientId: string, sessionId?: string): Promise<{ message: string, sessionId: string }> => {
  try {
    const response = await fetch(`${API_URL}/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        client_id: clientId,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// API para subir archivos
export const uploadFile = async (file: File, clientId: string, sessionId: string): Promise<{ message: string, sessionId: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('client_id', clientId);
    formData.append('session_id', sessionId);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// API para obtener sesiones del cliente
export const getClientSessions = async (clientId: string): Promise<Session[]> => {
  try {
    const response = await fetch(`${API_URL}/sessions?client_id=${clientId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

// API para obtener equipos de auditoría
export const getAuditTeams = async (): Promise<AuditTeam[]> => {
  try {
    const response = await fetch(`${API_URL}/teams`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

// API para obtener eventos de auditoría
export const getAuditEvents = async (teamId?: string, limit: number = 50): Promise<AuditEvent[]> => {
  try {
    let url = `${API_URL}/events?limit=${limit}`;
    if (teamId) {
      url += `&team_id=${teamId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// API para descargar el informe final de la auditoría
export const downloadAuditReport = async (sessionId: string): Promise<Blob> => {
  try {
    const response = await fetch(`${API_URL}/report/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.blob();
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
}; 