
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';

// Define UserRole type
type UserRole = 'admin' | 'client';

interface LoginFormData {
  email: string;
  password: string;
  role: UserRole;
}

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'client' // Default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await login(formData.email, formData.password);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        email: data.email,
        role: data.role
      }));

      // Call the callback to update App.tsx state
      onLoginSuccess(data.role as UserRole);
      
      // Navigate based on role
      if (data.role === 'admin') {
        navigate('/admin/clients');
      } else {
        navigate('/chat');
      }

    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'role' ? value as UserRole : value 
    }));
  };

  return (
    <div className="max-w-md w-full">
      <div className="md:hidden text-center mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-accent">
          Auditoría<span className="text-accent dark:text-soft-background">IA</span>
        </h1>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
        Iniciar sesión
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="ejemplo@empresa.com"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Tipo de usuario</div>
          <div className="flex space-x-6">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="client"
                checked={formData.role === 'client'}
                onChange={handleChange}
                className="form-radio text-primary focus:ring-primary"
                disabled={isLoading}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Cliente</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={formData.role === 'admin'}
                onChange={handleChange}
                className="form-radio text-primary focus:ring-primary"
                disabled={isLoading}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Administrador</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </div>
          ) : 'Iniciar sesión'}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
        Para pruebas: admin@audit.com / cliente@empresa.com (contraseña: password)
      </p>
    </div>
  );
}

export default LoginPage;
