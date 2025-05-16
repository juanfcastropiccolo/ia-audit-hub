// Tipos de datos para la aplicación

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant' | 'senior' | 'supervisor' | 'manager';
  timestamp: Date;
}

export interface Session {
  id: string;
  clientId: string;
  messages: Message[];
  created: Date;
  lastActivity: Date;
}

export interface Agent {
  name: string;
  role: 'assistant' | 'senior' | 'supervisor' | 'manager';
  status: 'idle' | 'working' | 'waiting';
  currentTask?: string;
}

export interface AuditTeam {
  id: string;
  clientId: string;
  agents: Agent[];
  currentTask?: string;
  status: 'idle' | 'working' | 'completed';
}

export interface AuditEvent {
  id: string;
  teamId: string;
  agentName: string;
  eventType: string;
  details: any;
  timestamp: Date;
  importance: 'low' | 'normal' | 'high' | 'critical';
} 