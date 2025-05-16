// Mock authentication service
interface User {
  name: string;
  email: string;
  role: 'admin' | 'client';
  token: string;
}

const mockUsers = [
  {
    email: 'admin@audit.com',
    password: 'password',
    name: 'Admin User',
    role: 'admin' as const
  },
  {
    email: 'cliente@empresa.com',
    password: 'password',
    name: 'Cliente Demo',
    role: 'client' as const
  }
];

export const login = async (email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  
  // Generate a mock token
  const token = btoa(`${user.email}:${Date.now()}`);
  
  return {
    email: user.email,
    name: user.name,
    role: user.role,
    token
  };
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse user data', e);
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}; 