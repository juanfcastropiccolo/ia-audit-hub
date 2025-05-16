
// Simple auth service (to be replaced with real API calls)

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'client';
}

export const login = async (email: string, password: string): Promise<User> => {
  // This would be a real API call in production
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'admin@example.com' && password === 'password') {
        const user = { 
          email: 'admin@example.com', 
          name: 'Admin User', 
          role: 'admin' as const 
        };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'mock-jwt-token-for-admin');
        resolve(user);
      } else if (email === 'client@example.com' && password === 'password') {
        const user = { 
          email: 'client@example.com', 
          name: 'Client User', 
          role: 'client' as const 
        };
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'mock-jwt-token-for-client');
        resolve(user);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
