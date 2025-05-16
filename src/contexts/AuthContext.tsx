
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthState, User } from '@/types';
import { mockAuthApi as authApi } from '@/api/apiService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isClient: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('audit-ia-token'),
    loading: true,
    error: null
  });
  
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (authState.token) {
        try {
          const response = await authApi.getProfile();
          if (response.success) {
            setAuthState(state => ({
              ...state,
              user: response.data,
              loading: false
            }));
          } else {
            // Token is invalid or expired
            setAuthState({
              user: null,
              token: null,
              loading: false,
              error: null
            });
            localStorage.removeItem('audit-ia-token');
          }
        } catch (error) {
          setAuthState({
            user: null,
            token: null,
            loading: false,
            error: 'Error fetching user profile'
          });
          localStorage.removeItem('audit-ia-token');
        }
      } else {
        setAuthState(state => ({
          ...state,
          loading: false
        }));
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(state => ({
      ...state,
      loading: true,
      error: null
    }));
    
    try {
      const response = await authApi.login(email, password);
      
      if (response.success) {
        setAuthState({
          user: response.data.user,
          token: response.data.token,
          loading: false,
          error: null
        });
        
        localStorage.setItem('audit-ia-token', response.data.token);
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin/clients');
        } else {
          navigate('/client/chat');
        }
        
        return true;
      } else {
        setAuthState(state => ({
          ...state,
          loading: false,
          error: response.message || 'Error al iniciar sesión'
        }));
        
        toast.error(response.message || 'Error al iniciar sesión');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      setAuthState(state => ({
        ...state,
        loading: false,
        error: errorMessage
      }));
      
      toast.error(errorMessage);
      return false;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        token: null,
        loading: false,
        error: null
      });
      
      localStorage.removeItem('audit-ia-token');
      navigate('/login');
    }
  };
  
  const isAuthenticated = !!authState.user && !!authState.token;
  const isClient = isAuthenticated && authState.user?.role === 'client';
  const isAdmin = isAuthenticated && authState.user?.role === 'admin';
  
  const value = {
    ...authState,
    login,
    logout,
    isAuthenticated,
    isClient,
    isAdmin
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
