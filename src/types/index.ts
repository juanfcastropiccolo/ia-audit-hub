
// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Message types
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SENIOR = 'senior',
  MANAGER = 'manager',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
  isMarkdown?: boolean;
}

// Client types
export interface Client {
  id: string;
  name: string;
  company: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
